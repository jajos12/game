import React from 'react';
import type { BoardCard } from '../../shared/types';
import MemoryCard from './MemoryCard';

interface GameBoardProps {
  board: BoardCard[];
  selections: string[];
  lockedUntil: number;
  onSelect: (cardId: string) => void;
  phase: 'memorize' | 'playing';
}

const GameBoard: React.FC<GameBoardProps> = ({ board, selections, lockedUntil, onSelect, phase }) => {
  const isLocked = Date.now() < lockedUntil;

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3 p-2 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner max-w-full overflow-hidden">
      {board.map((card) => (
        <MemoryCard
          key={card.cardId}
          card={card}
          isSelected={selections.includes(card.cardId)}
          isVisible={phase === 'memorize' || card.matched || selections.includes(card.cardId)}
          isLocked={isLocked || phase !== 'playing'}
          onSelect={() => onSelect(card.cardId)}
        />
      ))}
    </div>
  );
};

export default GameBoard;
