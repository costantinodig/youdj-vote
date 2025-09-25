import React, { useState } from 'react';
import JoinRoom from './JoinRoom.jsx';
import DJDashboard from './DJDashboard.jsx';
import GuestRoom from './GuestRoom.jsx';

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'dj', 'guest'
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = (code) => {
    setRoomCode(code);
    setView('guest');
  };

  const handleDJMode = () => {
    // Generate a room code for DJ
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newCode);
    setView('dj');
  };

  const handleBackToHome = () => {
    setView('home');
    setRoomCode('');
  };

  // Home screen - choose mode
  if (view === 'home') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>YouDJ Vote</h1>
        <p>Scegli come vuoi partecipare:</p>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleDJMode}
            style={{ 
              padding: '15px 30px', 
              fontSize: '16px', 
              marginRight: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sono il DJ
          </button>
          
          <button 
            onClick={() => setView('join')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sono un Ospite
          </button>
        </div>
      </div>
    );
  }

  // Join room screen for guests
  if (view === 'join') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <button 
          onClick={handleBackToHome}
          style={{ marginBottom: '20px', padding: '8px 16px' }}
        >
          ← Indietro
        </button>
        <JoinRoom onJoin={handleJoinRoom} />
      </div>
    );
  }

  // DJ Dashboard
  if (view === 'dj') {
    return (
      <div style={{ padding: '20px' }}>
        <button 
          onClick={handleBackToHome}
          style={{ marginBottom: '20px', padding: '8px 16px' }}
        >
          ← Esci
        </button>
        <DJDashboard 
          roomCode={roomCode} 
          onChangeRoom={setRoomCode} 
        />
      </div>
    );
  }

  // Guest Room
  if (view === 'guest') {
    return (
      <div style={{ padding: '20px' }}>
        <button 
          onClick={handleBackToHome}
          style={{ marginBottom: '20px', padding: '8px 16px' }}
        >
          ← Esci dalla Stanza
        </button>
        <GuestRoom roomCode={roomCode} />
      </div>
    );
  }

  return null;
}
