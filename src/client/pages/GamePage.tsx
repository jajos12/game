import React, { useEffect, useState, useCallback } from 'react';
import type { RoomHook } from '../hooks/useRoom';
import type { BoardCard, PlayerState } from '../../shared/types';

interface Props {
  roomHook: RoomHook;
}

const LITURGICAL_IMAGES = [
  '/images/censer.png', '/images/chalice.png', '/images/st-cyril.png', '/images/st-anthony.png',
  '/images/tabot.png', '/images/burning-bush.png', '/images/holy-myron.png', '/images/trinity.png',
  '/images/gospel.png', '/images/hand-cross.png', '/images/council-nicea.png', '/images/st-mary.png',
  '/images/qurban.png', '/images/noahs-ark.png', '/images/dove.png', '/images/st-george.png',
  '/images/alpha-omega.png', '/images/st-tekle-haymanot.png'
];

const GamePage: React.FC<Props> = ({ roomHook }) => {
  const { roomState, playerId, startGame, selectCard, leaveRoom } = roomHook;
  const [memorizeSeconds, setMemorizeSeconds] = useState(12);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Asset Loading state
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Reveal All Tool state
  const [hasUsedReveal, setHasUsedReveal] = useState(false);
  const [isRevealingAll, setIsRevealingAll] = useState(false);
  
  // Peek Tool state
  const [peekCharges, setPeekCharges] = useState(10);
  const [peekCooldown, setPeekCooldown] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);
  const [peekedCardId, setPeekedCardId] = useState<string | null>(null);

  // ===== ASSET PRELOADER =====
  useEffect(() => {
    let loaded = 0;
    const total = LITURGICAL_IMAGES.length;

    LITURGICAL_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.floor((loaded / total) * 100));
        if (loaded === total) setIsPreloaded(true);
      };
      img.onerror = () => {
        loaded++; // Count as loaded even if error to avoid blocking forever
        if (loaded === total) setIsPreloaded(true);
      };
    });
  }, []);

  const me = roomState?.players.find((p: PlayerState) => p.id === playerId);
  const mySelections = roomState?.selections[playerId || ''] || [];

  // ===== CLIENT-SIDE LOCK COUNTDOWN TIMER =====
  useEffect(() => {
    if (!me || me.lockedUntil <= 0) {
      setLockCountdown(0);
      return;
    }

    const updateLock = () => {
      const remaining = Math.max(0, Math.ceil((me.lockedUntil - Date.now()) / 1000));
      setLockCountdown(remaining);
    };

    updateLock();
    const interval = setInterval(updateLock, 200);
    return () => clearInterval(interval);
  }, [me?.lockedUntil]);

  const isLocked = lockCountdown > 0;

  // ===== MEMORIZE COUNTDOWN =====
  useEffect(() => {
    let timer: number;
    if (roomState?.phase === 'memorize') {
      setMemorizeSeconds(10);
      timer = window.setInterval(() => {
        setMemorizeSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [roomState?.phase]);

  // ===== ELAPSED GAME TIME =====
  useEffect(() => {
    let timer: number;
    if (roomState?.phase === 'playing' && roomState.startedAt) {
      timer = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (roomState.startedAt || 0) - 20000) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [roomState?.phase, roomState?.startedAt]);

  // ===== PEEK TOOL COOLDOWN TIMER =====
  useEffect(() => {
    let timer: number;
    if (roomState?.phase === 'playing' && peekCooldown > 0 && !isPeeking && !peekedCardId) {
      timer = window.setInterval(() => {
        setPeekCooldown(prev => {
          if (prev <= 1) {
            setPeekCharges(10); // Reset charges when cooldown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [roomState?.phase, peekCooldown, isPeeking, peekedCardId]);

  const handleSelect = useCallback((cardId: string) => {
    if (isLocked || isRevealingAll) return;
    
    if (isPeeking) {
      setIsPeeking(false);
      setPeekedCardId(cardId);
      
      const newCharges = peekCharges - 1;
      setPeekCharges(newCharges);
      
      if (newCharges <= 0) {
        setPeekCooldown(20);
      }
      
      // Clear peek after 3 seconds
      setTimeout(() => {
        setPeekedCardId(null);
      }, 3000);
      return;
    }
    
    selectCard(cardId);
  }, [selectCard, isLocked, isRevealingAll, isPeeking]);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId;

  // ===== LOBBY PHASE =====
  if (roomState.phase === 'lobby') {
    return (
      <div className="game-wrapper">
        <div className="lobby-wrapper">
          <div className="lobby-card">
            <div className="lobby-code-section">
              <div className="lobby-code-label">Room Code</div>
              <div className="lobby-code-row">
                <span className="lobby-code">{roomState.roomCode}</span>
                <button className="btn-copy" onClick={() => navigator.clipboard.writeText(roomState.roomCode)} title="Copy code">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
                Share this code with your congregation
              </p>
            </div>
            <div className="lobby-body">
              <div className="lobby-players-header">
                <div className="lobby-players-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Players ({roomState.players.length})
                </div>
                <span className="lobby-waiting-text">Waiting for others...</span>
              </div>
              <div className="lobby-players-grid">
                {roomState.players.map((player: PlayerState) => (
                  <div key={player.id} className={`lobby-player ${player.id === playerId ? 'lobby-player--me' : ''}`}>
                    <div className="lobby-player-left">
                      <div className={`lobby-avatar ${player.isHost ? 'lobby-avatar--host' : ''}`}>
                        {player.username[0]?.toUpperCase()}
                      </div>
                      <span className="lobby-player-name">
                        {player.username} {player.id === playerId ? '(You)' : ''}
                      </span>
                    </div>
                    {player.isHost && <span className="lobby-host-badge">Host</span>}
                  </div>
                ))}
              </div>
              {isHost ? (
                <button className="btn-start" onClick={startGame}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                  Start Competition
                </button>
              ) : (
                <div className="lobby-waiting-banner">Waiting for host to start...</div>
              )}
            </div>
          </div>
        </div>
        <footer className="game-footer">
          <span>© Ethiopian Orthodox Congregation</span>
          <button className="btn-exit" onClick={leaveRoom}>Exit Room</button>
        </footer>
      </div>
    );
  }

  // ===== MEMORIZE PHASE =====
  if (roomState.phase === 'memorize') {
    return (
      <div className="game-wrapper">
        <GameHeader roomCode={roomState.roomCode} isLocked={false} phase="memorize" lockCountdown={0} />
        <div className="game-main">
          <div className="memorize-overlay">
            <div className="memorize-timer-ring">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="4"/>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#f59e0b" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - memorizeSeconds / 10)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h2 className="memorize-title">Memorize!</h2>
            <p className="memorize-text">Study the grid — closing in <span>{memorizeSeconds}s</span></p>
          </div>
          <div className="memorize-grid-preview">
            <Board board={roomState.board} selections={[]} onSelect={() => {}} isLocked={true} showAll={true} wrongFlash={[]} peekedCardId={null} />
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING/LOADING PHASE =====
  if (roomState.phase === 'playing' || roomState.phase === 'loading') {
    const isActuallyLoading = roomState.phase === 'loading' || !isPreloaded;
    const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);
    const totalPairs = roomState.board.length / 2;
    const matchedCount = roomState.board.filter(c => c.matched).length / 2;
    
    return (
      <div className="game-wrapper">
        {isActuallyLoading && (
          <div className="loading-overlay">
            <div className="loading-circle"></div>
            <div>
              <div className="loading-title">ትንሽ ይጠብቁ!!!</div>
              <div className="loading-subtitle">በማውረድ ላይ ... {loadProgress}%</div>
              <div className="loading-progress-container">
                <div className="loading-progress-bar" style={{ width: `${loadProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div className={isActuallyLoading ? 'blur-content' : ''}>
          <GameHeader roomCode={roomState.roomCode} isLocked={isLocked} phase="playing" lockCountdown={lockCountdown} />
          <div className="game-main">
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span>{matchedCount}/{totalPairs} matched</span>
              </div>
              <div className="stat-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{formatTime(elapsedTime)}</span>
              </div>
              {me && me.wrongStreak > 0 && (
                <div className="stat-chip stat-chip--warn">
                  <span>⚠ {me.wrongStreak} miss{me.wrongStreak > 1 ? 'es' : ''}</span>
                </div>
              )}
              
              {/* Peek Tool Button */}
              {peekCooldown === 0 ? (
                <button 
                  className={`stat-chip btn-peek ${isPeeking ? 'btn-peek--active' : 'btn-peek--ready'}`} 
                  onClick={() => setIsPeeking(!isPeeking)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>{isPeeking ? 'Select a card!' : `Peek Tool (${peekCharges}/10)`}</span>
                </button>
              ) : (
                <div className="stat-chip stat-chip--cooldown">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                  <span>Recharging: {peekCooldown}s</span>
                </div>
              )}

              {/* Reveal All Tool Button */}
              {!hasUsedReveal ? (
                <button 
                  className={`stat-chip btn-peek ${isRevealingAll ? 'btn-peek--active' : 'btn-peek--ready'}`} 
                  onClick={() => {
                    if (isRevealingAll || hasUsedReveal) return;
                    setIsRevealingAll(true);
                    setHasUsedReveal(true);
                    setTimeout(() => setIsRevealingAll(false), 3000);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  <span>{isRevealingAll ? 'Revealing Board!' : 'Reveal All (1 Use)'}</span>
                </button>
              ) : (
                <div className="stat-chip stat-chip--cooldown">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  <span>Reveal Used</span>
                </div>
              )}
            </div>

            {/* Scoreboard */}
            <div className="scoreboard">
              {sortedPlayers.map((p, idx) => (
                <div key={p.id} className={`scoreboard-card ${p.id === playerId ? 'scoreboard-card--me' : ''}`}>
                  <div className="scoreboard-rank">#{idx + 1}</div>
                  <div className="scoreboard-info">
                    <div className="scoreboard-name">{p.username}</div>
                    <div className="scoreboard-score-row">
                      <span className="scoreboard-score">{p.score}</span>
                      <span className="scoreboard-pts">pts</span>
                    </div>
                  </div>
                  {p.wrongStreak >= 5 && <div className="scoreboard-locked-icon">🔒</div>}
                </div>
              ))}
            </div>

            {/* Hint Panel */}
            <HintPanel board={roomState.board} selections={peekedCardId ? [peekedCardId] : mySelections} />

            {/* Lock Overlay */}
            {isLocked && (
              <div className="lock-overlay">
                <div className="lock-overlay-inner">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Locked for {lockCountdown}s — 5 consecutive misses!</span>
                </div>
              </div>
            )}

            {/* Board */}
            <Board
              board={roomState.board}
              selections={mySelections}
              peekedCardId={peekedCardId}
              onSelect={handleSelect}
              isLocked={isLocked || isRevealingAll}
              showAll={isRevealingAll}
              wrongFlash={[]}
            />
          </div>
          <footer className="game-footer">
            <span>© Ethiopian Orthodox Congregation</span>
            <button className="btn-exit" onClick={leaveRoom}>Exit Room</button>
          </footer>
        </div>
      </div>
    );
  }

  // ===== FINISHED PHASE =====
  if (roomState.phase === 'finished') {
    const sorted = [...roomState.players].sort((a, b) => b.score - a.score);
    const gameDuration = roomState.endedAt && roomState.startedAt
      ? Math.floor((roomState.endedAt - roomState.startedAt - 20000) / 1000) // Adjustment for 10s loading + 10s memorize
      : 0;

    return (
      <div className="game-wrapper">
        <div className="results-wrapper">
          <div className="results-card">
            <div className="results-trophy">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V10a4 4 0 0 0-4-4"/><path d="M14 22V10a4 4 0 0 1 4-4"/><path d="M10 14h4"/></svg>
            </div>
            <h2 className="results-title">Competition Over!</h2>
            <p className="results-verse">"Well done, good and faithful servant"</p>
            {gameDuration > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                Completed in {formatTime(gameDuration)}
              </p>
            )}
            <div className="results-list">
              {sorted.map((player: PlayerState, index: number) => (
                <div key={player.id} className={`results-player ${index === 0 ? 'results-player--winner' : ''}`}>
                  <div className="results-player-left">
                    <span className="results-rank">#{index + 1}</span>
                    <div>
                      <div className="results-player-name">{player.username}</div>
                      <div className="results-player-tag">{index === 0 ? '👑 Champion' : 'Participant'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="results-score">{player.score}</div>
                    <div className="results-score-label">Points</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="results-actions">
              <button className="btn-secondary" onClick={leaveRoom}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Lobby
              </button>
              <button className="btn-primary" onClick={leaveRoom}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ===== HELPER: Format seconds as M:SS =====
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ===== SUB-COMPONENTS =====
function GameHeader({ roomCode, isLocked, phase, lockCountdown }: { roomCode: string; isLocked: boolean; phase: string; lockCountdown: number }) {
  return (
    <header className="game-header">
      <div className="game-logo">
        <div className="game-logo-icon">✝</div>
        <div className="game-logo-text">
          <h1>Tewahedo Match</h1>
          <p>Room: {roomCode}</p>
        </div>
      </div>
      {phase === 'playing' && (
        <div className={`game-status-badge ${isLocked ? 'game-status-badge--locked' : 'game-status-badge--live'}`}>
          <span className="game-status-dot" />
          {isLocked ? `Locked ${lockCountdown}s` : 'Live Match'}
        </div>
      )}
    </header>
  );
}

function HintPanel({ board, selections }: { board: BoardCard[]; selections: string[] }) {
  const selectedCards = selections.map(id => board.find((c: BoardCard) => c.cardId === id)).filter(Boolean) as BoardCard[];

  return (
    <div className="hint-panel">
      {[0, 1].map(index => {
        const card = selectedCards[index];
        return (
          <div key={index} className={`hint-slot ${card ? 'hint-slot--active' : ''}`}>
            <div className="hint-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div>
              <div className="hint-label">Hint {index + 1}: {card ? 'Revealed' : 'Select a card'}</div>
              <div className="hint-text">
                {card ? `"${card.hint}"` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Board({ board, selections, peekedCardId, onSelect, isLocked, showAll, wrongFlash }: {
  board: BoardCard[];
  selections: string[];
  peekedCardId: string | null;
  onSelect: (cardId: string) => void;
  isLocked: boolean;
  showAll: boolean;
  wrongFlash: string[];
}) {
  return (
    <div className="game-board">
      {board.map((card: BoardCard) => {
        const isPeeked = peekedCardId === card.cardId;
        const isSelected = selections.includes(card.cardId);
        const isVisible = showAll || card.matched || isSelected;
        const isCardLocked = isLocked || showAll;
        const isWrong = wrongFlash.includes(card.cardId);

        return (
          <div
            key={card.cardId}
            className={`memory-card ${card.matched ? 'memory-card--matched' : ''} ${isCardLocked && !showAll ? 'memory-card--locked' : ''} ${isSelected ? 'card-selected' : ''} ${isWrong ? 'card-wrong' : ''} ${isPeeked ? 'memory-card--peeked' : ''}`}
            onClick={() => { if (!isCardLocked && !card.matched) onSelect(card.cardId); }}
          >
            <div className={`card-inner ${isVisible ? 'card-inner--flipped' : ''}`}>
              <div className="card-face card-back">
                <div className="card-back-pattern">
                  <div className="card-back-diamond" />
                </div>
              </div>
              <div className="card-face card-front">
                <img
                  src={card.image}
                  alt={card.pairId}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="card-front-label">{card.pairId.replace(/-/g, ' ')}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GamePage;
