import React, { useEffect, useMemo, useState } from "react";

// API base URL for backend calls
const API = import.meta.env.VITE_API_BASE || "";

export default function DJDashboard({ roomCode, onChangeRoom }) {
  const [pin, setPin] = useState("");
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [mini, setMini] = useState([]);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load data functions
  async function loadSongs() {
    if (!roomCode) return;
    try {
      const res = await fetch(`${API}/api/rooms/${roomCode}/songs`, { credentials: "include" });
      const data = await res.json();
      setSongs(data);
    } catch (e) {
      console.error("Error loading songs:", e);
    }
  }

  async function loadMini() {
    if (!roomCode) return;
    try {
      const res = await fetch(`${API}/api/rooms/${roomCode}/mini`, { credentials: "include" });
      const data = await res.json();
      setMini(data);
    } catch (e) {
      console.error("Error loading mini playlist:", e);
    }
  }

  async function loadState() {
    if (!roomCode) return;
    try {
      const res = await fetch(`${API}/api/rooms/${roomCode}/state`, { credentials: "include" });
      const data = await res.json();
      setCurrent(data && data.current_song_id ? data : null);
    } catch (e) {
      console.error("Error loading state:", e);
    }
  }

  // Load data when roomCode changes
  useEffect(() => {
    if (roomCode) {
      loadSongs();
      loadMini();
      loadState();
    }
  }, [roomCode]);

  // Add song function
  async function addSong() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/rooms/${roomCode}/songs`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ title, artist, url, djPin: pin })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTitle("");
        setArtist("");
        setUrl("");
        await loadSongs();
      }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }

  // Save mini playlist
  async function saveMini() {
    const songIds = mini.map(s => s.id);
    try {
      await fetch(`${API}/api/rooms/${roomCode}/mini`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ songIds, djPin: pin })
      });
      await loadMini();
    } catch (e) {
      console.error("Error saving mini playlist:", e);
    }
  }

  // Set playing song
  async function setPlaying(id) {
    try {
      await fetch(`${API}/api/rooms/${roomCode}/play`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ songId: id, djPin: pin })
      });
      await loadState();
    } catch (e) {
      console.error("Error setting playing song:", e);
    }
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Dashboard DJ — Stanza {roomCode || "(nessuna)"}</h1>
      
      {!roomCode && (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          <p>Inserisci un codice stanza nella pagina precedente.</p>
          <button onClick={() => onChangeRoom("")} style={{ padding: '8px 16px' }}>
            ← Torna Indietro
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginTop: '20px'
      }}>
        <div>
          <h3>PIN DJ</h3>
          <input 
            placeholder="PIN" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '8px',
              width: '200px'
            }}
          />
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            Serve per aggiungere brani e gestire la serata.
          </p>

          <h3>Aggiungi brano</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            <input 
              placeholder="Titolo" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input 
              placeholder="Artista" 
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input 
              placeholder="URL (YouTube o MP3 opzionale)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button 
              onClick={addSong}
              disabled={loading || !title.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Aggiungendo...' : 'Aggiungi'}
            </button>
          </div>
          {error && <div style={{ color: 'crimson', fontSize: '14px' }}>{error}</div>}

          <h3>Tutte le canzoni (ordinate per voti)</h3>
          <ul style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {songs.map(s => (
              <li key={s.id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                <div><strong>{s.title}</strong> — {s.artist || "Sconosciuto"} ({s.votes} voti)</div>
                <div style={{ marginTop: '5px' }}>
                  <button 
                    onClick={() => setMini(m => m.find(x => x.id === s.id) ? m : [...m, s])}
                    style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}
                  >
                    Aggiungi alla Mini
                  </button>
                  <button 
                    onClick={() => setPlaying(s.id)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Metti in Riproduzione
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Mini-playlist (max 10)</h3>
          <ol style={{ marginBottom: '15px' }}>
            {mini.map((s, idx) => (
              <li key={s.id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                <div><strong>{s.title}</strong> — {s.artist || "Sconosciuto"} ({s.votes ?? 0} voti)</div>
                <div style={{ marginTop: '5px' }}>
                  <button 
                    onClick={() => setMini(mini.filter(x => x.id !== s.id))}
                    style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}
                  >
                    Rimuovi
                  </button>
                  {idx > 0 && (
                    <button 
                      onClick={() => {
                        const copy = [...mini];
                        [copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]];
                        setMini(copy);
                      }}
                      style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}
                    >
                      Su
                    </button>
                  )}
                  {idx < mini.length - 1 && (
                    <button 
                      onClick={() => {
                        const copy = [...mini];
                        [copy[idx+1], copy[idx]] = [copy[idx], copy[idx+1]];
                        setMini(copy);
                      }}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Giù
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <button 
            onClick={saveMini}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Salva Mini
          </button>

          <h3>In riproduzione</h3>
          {current ? (
            <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <div><strong>{current.title}</strong> — {current.artist || "Sconosciuto"}</div>
              {current.url ? (
                <Player url={current.url} />
              ) : (
                <em>Nessun URL: riproduzione esterna</em>
              )}
            </div>
          ) : (
            <em>Nessun brano in riproduzione</em>
          )}
        </div>
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
        width="400"
        height="225"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return <audio controls src={url} style={{ width: '100%' }} />;
}
