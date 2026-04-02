import React, { useState } from 'react';
import type { RoomHook } from '../hooks/useRoom';

interface Props {
  roomHook: RoomHook;
}

const HomePage: React.FC<Props> = ({ roomHook }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { createRoom, joinRoom, error } = roomHook;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) createRoom(username.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim()) {
      joinRoom(roomCode.trim().toUpperCase(), username.trim());
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <header className="home-header">
          <div className="home-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5L6 7.5h4.5z"/>
            </svg>
          </div>
          <h1 className="home-title">Tewahedo Match</h1>
          <p className="home-subtitle">Multiplayer Liturgical Memory Game</p>
        </header>

        {error && <div className="home-error">{error}</div>}

        <div>
          <label className="home-label">Your Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="home-input"
          />
        </div>

        <div className="home-actions">
          <button onClick={handleCreate} disabled={!username.trim()} className="btn-host">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            Host Game
          </button>
          <div className="join-section">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="CODE"
              className="join-input"
              maxLength={6}
            />
            <button onClick={handleJoin} disabled={!username.trim() || !roomCode.trim()} className="btn-join">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Join
            </button>
          </div>
        </div>

        <footer className="home-footer">
          Built for Christian Congregation · Oriental Orthodox
        </footer>
      </div>

      <div className="home-glow home-glow--top" />
      <div className="home-glow home-glow--bottom" />
    </div>
  );
};

export default HomePage;
