import React, { useState } from 'react';

export default function DJDashboard({ roomCode, onChangeRoom }) {
  const [currentSong, setCurrentSong] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [votes, setVotes] = useState({});

  const generateRoomCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (onChangeRoom) {
      onChangeRoom(newCode);
    }
  };

  const addSongToPlaylist = (song) => {
    // Placeholder per aggiungere canzoni alla playlist
    setPlaylist([...playlist, { id: Date.now(), title: song, votes: 0 }]);
  };

  return (
    <div>
      <h1>DJ Dashboard</h1>
      
      <div>
        <h2>Codice Stanza: {roomCode || 'Non assegnato'}</h2>
        <button onClick={generateRoomCode}>
          Genera Nuovo Codice
        </button>
      </div>
      
      <div>
        <h3>Canzone Corrente</h3>
        <p>{currentSong || 'Nessuna canzone in riproduzione'}</p>
      </div>
      
      <div>
        <h3>Playlist con Voti</h3>
        {playlist.length === 0 ? (
          <p>Nessuna canzone in playlist</p>
        ) : (
          <ul>
            {playlist.map((song) => (
              <li key={song.id}>
                {song.title} - Voti: {song.votes}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div>
        <h3>Controlli DJ</h3>
        <button onClick={() => setCurrentSong(playlist[0]?.title || '')}>Riproduci Prossima</button>
        <button onClick={() => setCurrentSong('')}>Ferma Musica</button>
      </div>
    </div>
  );
}
