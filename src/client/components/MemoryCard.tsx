import React from 'react';
import type { BoardCard } from '../../shared/types';

interface MemoryCardProps {
  card: BoardCard;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  onSelect: () => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, isSelected, isVisible, isLocked, onSelect }) => {
  return (
    <button
      onClick={() => !isLocked && onSelect()}
      disabled={isLocked || card.matched}
      className={`
        relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 transform
        ${card.matched ? 'opacity-40 grayscale-[0.5]' : 'hover:scale-[1.02] active:scale-95 shadow-lg'}
        ${isSelected ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-slate-900 z-10' : ''}
      `}
    >
      <div className={`
        w-full h-full transition-all duration-500 preserve-3d
        ${isVisible ? 'rotate-y-0' : 'rotate-y-180'}
      `}>
        {/* Front (Image/Icon) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-800 flex items-center justify-center p-1 sm:p-2 border border-slate-700/50 rounded-lg sm:rounded-xl shadow-inner">
          {card.image ? (
            <img 
              src={card.image} 
              alt={card.pairId} 
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('flex-col');
              }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
             <span className="text-[10px] font-bold uppercase text-amber-500/80 leading-tight break-words">
               {card.pairId.replace(/-/g, ' ')}
             </span>
          </div>
        </div>

        {/* Back (Pattern) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50 rounded-lg sm:rounded-xl">
           <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-amber-500/20 rounded-full flex items-center justify-center">
             <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-500/30 rounded-sm rotate-45" />
           </div>
        </div>
      </div>
    </button>
  );
};

export default MemoryCard;
