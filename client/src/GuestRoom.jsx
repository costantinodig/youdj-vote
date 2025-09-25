import React, { useEffect, useState } from "react";

// API base URL for backend calls
const API = import.meta.env.VITE_API_BASE || "";

export default function GuestRoom({ roomCode }) {
  const [songs, setSongs] = useState([]);
  const [mini, setMini] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all room data
  async function loadAll() {
    if (!roomCode) return;
    try {
      const [songsRes, miniRes, currentRes] = await Promise.all([
        fetch(`${API}/api/rooms/${roomCode}/songs`, { credentials: "include" }),
        fetch(`${API}/api/rooms/${roomCode}/mini`, { credentials: "include" }),
        fetch(`${API}/api/rooms/${roomCode}/state`, { credentials: "include" })
      ]);
      
      const songsData = await songsRes.json();
      const miniData = await miniRes.json();
      const currentData = await currentRes.json();
      
      setSongs(songsData || []);
      setMini(miniData || []);
      setCurrent(currentData && currentData.current_song_id ? currentData : null);
    } catch (e) {
      console.error("Error loading room data:", e);
    }
  }

  // Load data when roomCode changes
  useEffect(() => {
    loadAll();
  }, [roomCode]);

  // Vote for a song
  async function vote(id) {
    if (!id || loading) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/rooms/${roomCode}/vote`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ songId: id })
      });
      await loadAll(); // Reload data to get updated vote counts
    } catch (e) {
      console.error("Error voting:", e);
    }
    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Stanza {roomCode}</h1>
      
      {/* Currently Playing */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: current ? '#e8f5e8' : '#f5f5f5',
        borderRadius: '8px',
        border: current ? '2px solid #4CAF50' : '1px solid #ddd'
      }}>
        <h2>Brano in riproduzione</h2>
        {current ? (
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {current.title} — {current.artist || "Sconosciuto"}
            </div>
            {current.url ? (
              <Player url={current.url} />
            ) : (
              <em>Riproduzione gestita dal DJ</em>
            )}
          </div>
        ) : (
          <em>Nessun brano in riproduzione</em>
        )}
      </div>

      {/* Mini Playlist Voting */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Vota il prossimo (Mini-playlist)</h2>
        {mini.length === 0 ? (
          <p>Nessun brano nella mini-playlist</p>
        ) : (
          <ol>
            {mini.map((s, index) => (
              <li key={s.id} style={{
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {s.title} — {s.artist || "Sconosciuto"}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {s.votes ?? 0} voti • Posizione #{index + 1}
                    </div>
                  </div>
                  <button 
                    onClick={() => vote(s.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Votando...' : 'Vota'}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* All Songs */}
      <div>
        <h2>Tutte le canzoni</h2>
        {songs.length === 0 ? (
          <p>Nessuna canzone disponibile</p>
        ) : (
          <ul>
            {songs.map((s) => (
              <li key={s.id} style={{
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {s.title} — {s.artist || "Sconosciuto"}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {s.votes} voti
                    </div>
                  </div>
                  <button 
                    onClick={() => vote(s.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Votando...' : 'Vota'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Refresh Button */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={loadAll}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Aggiornando...' : 'Aggiorna'}
        </button>
      </div>
    </div>
  );
}

// Player component for YouTube and audio files
function Player({ url }) {
  if (/youtu\.be|youtube\.com/.test(url)) {
    const idMatch = url.match(/[?&]v=([^&]+)|youtu\.be\/([^?]+)/);
    const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
    if (!id) return <div>URL YouTube non riconosciuto</div>;
    return (
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ maxWidth: '560px', marginTop: '10px' }}
      />
    );
  }
  return <audio controls src={url} style={{ width: '100%', marginTop: '10px' }} />;
}
