import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import JoinRoom from "./JoinRoom.jsx";
import DJDashboard from "./DJDashboard.jsx";
import GuestRoom from "./GuestRoom.jsx";

// API base URL for backend calls  
const API = import.meta.env.VITE_API_BASE || "";

// Socket.io connection
const socket = io("/", { path: "/socket.io" });

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState(""); // "" | "dj" | "guest"

  // Socket connection and room joining
  useEffect(() => {
    if (roomCode) socket.emit("joinRoom", { roomCode });
  }, [roomCode]);

  if (!mode) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>YouDJ Vote</h1>
        <h2>Scegli come entrare:</h2>
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button onClick={() => setMode("dj")}>
            Sono il DJ
          </button>
          <button onClick={() => setMode("guest")}>
            Sono un Ospite
          </button>
        </div>
        <JoinRoom onJoin={(code) => setRoomCode(code)} />
      </div>
    );
  }

  if (mode === "dj") return <DJDashboard roomCode={roomCode} onChangeRoom={setRoomCode} />;
  return <GuestRoom roomCode={roomCode} />;
}
