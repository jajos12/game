import React from 'react';
import type { RoomState, PlayerState } from '../../shared/types';
import { Users, Play, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LobbyProps {
  roomState: RoomState;
  playerId?: string;
  onStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ roomState, playerId, onStart }) => {
  const [copied, setCopied] = useState(false);
  const isHost = roomState.hostId === playerId;

  const copyCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass overflow-hidden shadow-2xl">
        <div className="bg-amber-600/20 p-8 text-center border-b border-amber-500/20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-2">Room Code</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl font-mono font-bold tracking-tighter text-white">
              {roomState.roomCode}
            </span>
            <button 
              onClick={copyCode}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Players ({roomState.players.length})
            </h3>
            <span className="text-xs text-slate-400">Waiting for others to join...</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {roomState.players.map((player: PlayerState) => (
              <div 
                key={player.id} 
                className={`p-4 rounded-xl flex items-center justify-between ${
                  player.id === playerId ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/40 border border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    player.isHost ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {player.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {player.username} {player.id === playerId && '(You)'}
                  </span>
                </div>
                {player.isHost && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold border border-amber-500/30">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>

          {isHost ? (
            <button
              onClick={onStart}
              disabled={roomState.players.length < 1}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-600/20 transition-all active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              Start Competition
            </button>
          ) : (
            <div className="text-center p-4 bg-slate-800/50 rounded-xl text-slate-400 font-medium animate-pulse">
              Waiting for host to start...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
