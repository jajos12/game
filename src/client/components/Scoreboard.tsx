import React from 'react';
import type { PlayerState } from '../../shared/types';
import { Trophy, Medal, User } from 'lucide-react';

interface ScoreboardProps {
  players: PlayerState[];
  currentPlayerId?: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Live Leaderboard</h3>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isCurrent = player.id === currentPlayerId;
          const isWinner = index === 0 && player.score > 0;

          return (
            <div 
              key={player.id}
              className={`
                flex-shrink-0 min-w-[120px] p-3 rounded-xl border transition-all duration-300
                ${isCurrent ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10' : 'bg-slate-800/40 border-slate-700/50'}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {isWinner ? (
                  <Medal className="w-4 h-4 text-amber-400" />
                ) : (
                  <User className={`w-4 h-4 ${isCurrent ? 'text-amber-500' : 'text-slate-500'}`} />
                )}
                <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                   {player.username}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{player.score}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;
