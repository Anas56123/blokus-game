// src/components/GameBoard.tsx

import React from 'react';
import { Cell, GameState, PlayerColor } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
  // Other props for piece selection, etc.
}

// Define the size of the Blokus board
const BOARD_SIZE = 20;

const getColorClass = (owner: PlayerColor | null): string => {
  if (!owner) return 'bg-gray-100 border-gray-300';
  return `bg-${owner}-500 border-${owner}-700`; // Requires Tailwind CSS setup
};

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick }) => {
  return (
    <div className="flex justify-center p-4">
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: '800px', // Adjust size as needed
          aspectRatio: '1 / 1',
          border: '2px solid #333',
        }}
      >
        {gameState.board.map((row, r) =>
          row.map((cell: Cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-full h-full ${getColorClass(cell.owner)} border border-gray-200 cursor-pointer`}
              onClick={() => onCellClick(r, c)}
              // Add a subtle marker for corner cells
              title={cell.isCorner ? 'Start Corner' : ''}
              style={{
                boxSizing: 'border-box',
                // Optional: visual cue for the corner cells for first move
                ...(cell.isCorner && { backgroundColor: 'rgba(0, 0, 0, 0.1)' })
              }}
            >
              {/* Optional: Add a simple cell indicator */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};