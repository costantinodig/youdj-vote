import React, { useState } from 'react';

export default function JoinRoom({ onJoin }) {
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim() && onJoin) {
      onJoin(roomCode.trim());
    }
  };

  return (
    <div>
      <h2>Entra in una Stanza</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="roomCode">Codice Stanza:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Inserisci il codice della stanza"
          />
        </div>
        <button type="submit" disabled={!roomCode.trim()}>
          Entra
        </button>
      </form>
    </div>
  );
}
