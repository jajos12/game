import React from 'react';
import type { PlayerState } from '../../shared/types';
import { Trophy, Home, RotateCcw } from 'lucide-react';

interface ResultsProps {
  players: PlayerState[];
  onHome: () => void;
}

const Results: React.FC<ResultsProps> = ({ players, onHome }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  // winner is sortedPlayers[0] for ranking logic

  return (
    <div className="max-w-md mx-auto p-6 animate-in zoom-in duration-500">
      <div className="glass p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
        
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full mb-6 shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-black text-white mb-1">Competition Over!</h2>
        <p className="text-slate-400 mb-8 font-medium italic">"Well done, good and faithful servant"</p>

        <div className="space-y-4 mb-10">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`
                flex items-center justify-between p-4 rounded-2xl border transition-all
                ${index === 0 ? 'bg-amber-500/20 border-amber-500/50 scale-105' : 'bg-slate-800/40 border-slate-700/50'}
              `}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl font-black ${index === 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                  #{index + 1}
                </span>
                <div className="text-left">
                  <p className="font-bold text-white text-lg leading-none mb-1">{player.username}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {index === 0 ? 'Champion' : 'Participant'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{player.score}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Points</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={onHome}
             className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
           >
             <Home className="w-5 h-5" />
             Lobby
           </button>
           <button 
             onClick={onHome}
             className="flex items-center justify-center gap-2 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-amber-600/10"
           >
             <RotateCcw className="w-5 h-5" />
             Rematch
           </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
