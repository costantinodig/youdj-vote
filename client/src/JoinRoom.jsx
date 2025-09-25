import React, { useState } from "react";

// API base URL for backend calls
const API = import.meta.env.VITE_API_BASE || "";

export default function JoinRoom({ onJoin }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ name, djPin: pin }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.code) {
        onJoin(data.code);
      } else {
        setError(data.error || "Errore creazione stanza");
      }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Accedi a una Stanza</h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <input 
          placeholder="Codice Stanza (es. ABC123)" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={() => onJoin(code)}
          disabled={!code.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Entra
        </button>
      </div>
      
      <hr style={{ margin: '24px 0' }} />
      
      <button 
        onClick={() => setCreateMode(v => !v)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '15px'
        }}
      >
        {createMode ? "Chiudi" : "Crea nuova Stanza (DJ)"}
      </button>
      
      {createMode && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '420px'
        }}>
          <input 
            placeholder="Nome serata" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input 
            placeholder="PIN DJ (sceglilo tu)" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={createRoom}
            disabled={loading || !name.trim() || !pin.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Creando...' : 'Crea'}
          </button>
          {error && (
            <div style={{ color: 'crimson', fontSize: '14px', marginTop: '8px' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
