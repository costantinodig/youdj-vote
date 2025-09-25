import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

let db;

async function initDB() {
  db = await open({
    filename: "./data.db",
    driver: sqlite3.Database
  });
  const schema = await (await import("fs")).promises.readFile("./schema.sql", "utf-8");
  await db.exec(schema);
}

await initDB();

function randomCode(len=6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

// Middleware for user ID
app.use((req, res, next) => {
  if (!req.cookies.uid) {
    res.cookie("uid", uuidv4(), { httpOnly: false, sameSite: "lax" });
  }
  next();
});

// Health
app.get("/api/health", (req, res) => res.json({ok:true}));

// Create room (DJ)
app.post("/api/rooms", async (req, res) => {
  const { name, djPin } = req.body || {};
  if (!name || !djPin) return res.status(400).json({ error: "name e djPin sono obbligatori" });
  
  let code;
  let exists = true;
  while (exists) {
    code = randomCode(6);
    const row = await db.get("SELECT code FROM rooms WHERE code = ?", code);
    exists = !!row;
  }
  
  await db.run("INSERT INTO rooms (code, name, dj_pin) VALUES (?,?,?)", code, name, djPin);
  await db.run("INSERT OR IGNORE INTO room_state (room_code) VALUES (?)", code);
  
  res.json({ code });
});

// Helper: check DJ auth
async function isDJ(roomCode, pin) {
  const row = await db.get("SELECT dj_pin FROM rooms WHERE code = ?", roomCode);
  return row && row.dj_pin === pin;
}

// Add song (DJ)
app.post("/api/rooms/:code/songs", async (req, res) => {
  const { code } = req.params;
  const { title, artist, url, djPin } = req.body || {};
  
  if (!await isDJ(code, djPin)) return res.status(401).json({ error: "PIN DJ non valido" });
  if (!title) return res.status(400).json({ error: "title è obbligatorio" });
  
  const added_by = "DJ";
  const result = await db.run(
    "INSERT INTO songs (room_code, title, artist, url, added_by) VALUES (?,?,?,?,?)",
    code, title, artist || "", url || "", added_by
  );
  
  const song = await db.get("SELECT * FROM songs WHERE id = ?", result.lastID);
  io.to(code).emit("songsUpdated", { roomCode: code });
  
  res.json(song);
});

// List songs with vote counts
app.get("/api/rooms/:code/songs", async (req, res) => {
  const { code } = req.params;
  const rows = await db.all(
    `SELECT s.*, COALESCE(v.cnt,0) as votes
     FROM songs s
     LEFT JOIN (SELECT song_id, COUNT(*) cnt FROM votes GROUP BY song_id) v ON s.id = v.song_id
     WHERE s.room_code = ?
     ORDER BY votes DESC, s.created_at ASC`,
    code
  );
  res.json(rows);
});

// Vote a song (guest)
app.post("/api/rooms/:code/vote", async (req, res) => {
  const { code } = req.params;
  const { songId } = req.body || {};
  const userId = req.cookies.uid;
  
  if (!songId) return res.status(400).json({ error: "songId è obbligatorio" });
  
  try {
    await db.run("INSERT INTO votes (song_id, user_id) VALUES (?,?)", songId, userId);
  } catch (e) {
    // already voted for that song -> ignore
  }
  
  io.to(code).emit("votesUpdated", { roomCode: code, songId });
  res.json({ ok: true });
});

// Set mini playlist (DJ)
app.post("/api/rooms/:code/mini", async (req, res) => {
  const { code } = req.params;
  const { songIds, djPin } = req.body || {};
  
  if (!await isDJ(code, djPin)) return res.status(401).json({ error: "PIN DJ non valido" });
  if (!Array.isArray(songIds)) return res.status(400).json({ error: "songIds deve essere un array" });
  
  await db.run("DELETE FROM mini_playlist WHERE room_code = ?", code);
  
  const stmt = await db.prepare("INSERT INTO mini_playlist (room_code, song_id, position) VALUES (?,?,?)");
  let pos = 1;
  for (const id of songIds.slice(0,10)) {
    await stmt.run(code, id, pos++);
  }
  await stmt.finalize();
  
  io.to(code).emit("miniUpdated", { roomCode: code });
  res.json({ ok: true });
});

// Get mini playlist
app.get("/api/rooms/:code/mini", async (req, res) => {
  const { code } = req.params;
  const rows = await db.all(
    `SELECT s.*, COALESCE(v.cnt,0) as votes, m.position
     FROM mini_playlist m
     JOIN songs s ON s.id = m.song_id
     LEFT JOIN (SELECT song_id, COUNT(*) cnt FROM votes GROUP BY song_id) v ON s.id = v.song_id
     WHERE m.room_code = ?
     ORDER BY m.position ASC`,
    code
  );
  res.json(rows);
});

// Set current playing (DJ)
app.post("/api/rooms/:code/play", async (req, res) => {
  const { code } = req.params;
  const { songId, djPin } = req.body || {};
  
  if (!await isDJ(code, djPin)) return res.status(401).json({ error: "PIN DJ non valido" });
  
  await db.run(
    "UPDATE room_state SET current_song_id = ?, updated_at = CURRENT_TIMESTAMP WHERE room_code = ?",
    songId || null, code
  );
  
  io.to(code).emit("playingUpdated", { roomCode: code, songId });
  res.json({ ok: true });
});

// Get room state
app.get("/api/rooms/:code/state", async (req, res) => {
  const { code } = req.params;
  const row = await db.get(
    `SELECT rs.current_song_id, s.title, s.artist, s.url
     FROM room_state rs
     LEFT JOIN songs s ON s.id = rs.current_song_id
     WHERE rs.room_code = ?`,
    code
  );
  res.json(row || {});
});

// Socket.io: join room
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomCode }) => {
    if (roomCode) {
      socket.join(roomCode);
    }
  });
});

server.listen(PORT, () => {
  console.log(`YouDJ Vote server in ascolto su http://localhost:${PORT}`);
});
