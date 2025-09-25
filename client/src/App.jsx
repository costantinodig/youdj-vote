import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import JoinRoom from "./JoinRoom.jsx";
import DJDashboard from "./DJDashboard.jsx";
import GuestRoom from "./GuestRoom.jsx";

const socket = io("/", { path: "/socket.io" });

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState(""); // "" | "dj" | "guest"

  useEffect(() => {
    if (roomCode) socket.emit("joinRoom", { roomCode });
  }, [roomCode]);

  if (!mode) {
    return (
      <div>
        <h1>YouDJ Vote</h1>
        <p>Scegli come entrare:</p>
        <button onClick={() => setMode("dj")}>Sono il DJ</button>
        <button onClick={() => setMode("guest")}>Sono un Ospite</button>
        <JoinRoom onJoin={(code) => setRoomCode(code)} />
      </div>
    );
  }

  if (mode === "dj") return <DJDashboard roomCode={roomCode} onChangeRoom={setRoomCode} />;
  return <GuestRoom roomCode={roomCode} />;
}
