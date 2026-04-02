import React from 'react';
import type { BoardCard } from '../../shared/types';
import { HelpCircle, Info } from 'lucide-react';

interface HintPanelProps {
  selections: string[];
  board: BoardCard[];
}

const HintPanel: React.FC<HintPanelProps> = ({ selections, board }) => {
  const selectedCards = selections.map(id => board.find(c => c.cardId === id)).filter(Boolean) as BoardCard[];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 text-amber-500 mb-1">
        <HelpCircle className="w-5 h-5" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Theological Hints</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1].map(index => {
          const card = selectedCards[index];
          return (
            <div 
              key={index} 
              className={`min-h-[80px] p-4 rounded-2xl glass flex gap-3 items-start transition-all duration-300 ${
                card ? 'border-amber-500/40 bg-amber-500/5' : 'opacity-40 border-slate-800'
              }`}
            >
              <div className={`mt-1 p-1 rounded-lg ${card ? 'bg-amber-500' : 'bg-slate-800'}`}>
                <Info className={`w-4 h-4 ${card ? 'text-slate-900' : 'text-slate-600'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase mb-1 leading-none ${card ? 'text-amber-500' : 'text-slate-500'}`}>
                  Slot {index + 1}: {card ? 'Revealed' : 'Empty'}
                </p>
                <p className={`text-sm font-medium italic leading-tight ${card ? 'text-white' : 'text-slate-600'}`}>
                  {card ? `"${card.hint}"` : "Select a card to see its hint..."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HintPanel;
