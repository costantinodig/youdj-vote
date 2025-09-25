import React, { useState, useEffect } from 'react';

export default function GuestRoom({ roomCode }) {
  const [currentSong, setCurrentSong] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [songSuggestion, setSongSuggestion] = useState('');
  const [userVotes, setUserVotes] = useState(new Set());

  const handleVote = (songId) => {
    if (userVotes.has(songId)) {
      // Rimuovi il voto se già votato
      setUserVotes(prev => {
        const newVotes = new Set(prev);
        newVotes.delete(songId);
        return newVotes;
      });
    } else {
      // Aggiungi il voto
      setUserVotes(prev => new Set(prev).add(songId));
    }
  };

  const handleSuggestSong = (e) => {
    e.preventDefault();
    if (songSuggestion.trim()) {
      // Placeholder per suggerire una canzone
      const newSong = {
        id: Date.now(),
        title: songSuggestion.trim(),
        votes: 0,
        suggested: true
      };
      setPlaylist([...playlist, newSong]);
      setSongSuggestion('');
    }
  };

  return (
    <div>
      <h1>Guest Room - Stanza: {roomCode}</h1>
      
      <div>
        <h2>Ora in Riproduzione</h2>
        <p>{currentSong || 'Nessuna canzone in riproduzione'}</p>
      </div>
      
      <div>
        <h3>Suggerisci una Canzone</h3>
        <form onSubmit={handleSuggestSong}>
          <input
            type="text"
            value={songSuggestion}
            onChange={(e) => setSongSuggestion(e.target.value)}
            placeholder="Nome canzone o artista"
          />
          <button type="submit" disabled={!songSuggestion.trim()}>
            Suggerisci
          </button>
        </form>
      </div>
      
      <div>
        <h3>Playlist - Vota le tue preferite!</h3>
        {playlist.length === 0 ? (
          <p>Nessuna canzone in playlist</p>
        ) : (
          <ul>
            {playlist.map((song) => (
              <li key={song.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                <div>
                  <strong>{song.title}</strong>
                  {song.suggested && <span> (Suggerita da te)</span>}
                </div>
                <div>
                  Voti: {song.votes}
                  <button
                    onClick={() => handleVote(song.id)}
                    style={{
                      marginLeft: '10px',
                      backgroundColor: userVotes.has(song.id) ? '#ff4444' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px'
                    }}
                  >
                    {userVotes.has(song.id) ? 'Rimuovi Voto' : 'Vota'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
