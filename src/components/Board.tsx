// components/Board.tsx
import React, { useState } from 'react';
import { PlayerColor, Coordinate } from '../types';
import { BOARD_SIZE } from '../types/constants';
import { isValidMove } from '../utils';

interface BoardProps {
  grid: (PlayerColor | null)[][];
  currentPlayer: PlayerColor;
  selectedPieceShape: Coordinate[] | null;
  onPlacePiece: (x: number, y: number) => void;
  darkMode?: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, currentPlayer, selectedPieceShape, onPlacePiece, darkMode = false }) => {
  const [hoverPos, setHoverPos] = useState<Coordinate | null>(null);

  const getColorClass = (color: PlayerColor | null) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 border-blue-800';
      case 'yellow': return 'bg-yellow-400 border-yellow-600';
      case 'red': return 'bg-red-600 border-red-800';
      case 'green': return 'bg-green-600 border-green-800';
      default: return darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300';
    }
  };

  const isGhostBlock = (r: number, c: number): boolean => {
    if (!hoverPos || !selectedPieceShape) return false;
    // Check if the current cell (r,c) is part of the piece if placed at hoverPos
    return selectedPieceShape.some(block => 
      hoverPos.x + block.x === c && hoverPos.y + block.y === r
    );
  };

  // Check validity for ghost coloring
  const isHoverValid = hoverPos && selectedPieceShape 
    ? isValidMove(grid, selectedPieceShape, hoverPos.x, hoverPos.y, currentPlayer)
    : false;

  return (
    <div 
      className={`grid gap-px border-2 p-1 select-none ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-400 border-gray-800'}`}
      style={{ 
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        width: '600px',
        height: '600px',
        minWidth: '600px',
        minHeight: '600px'
      }}
      onMouseLeave={() => setHoverPos(null)}
    >
      {grid.map((row, r) => (
        row.map((cell, c) => {
          const isGhost = isGhostBlock(r, c);
          let cellClass = getColorClass(cell);

          if (isGhost && cell === null) {
             cellClass = isHoverValid 
               ? `bg-opacity-50 ${getColorClass(currentPlayer)}` // Valid move preview
               : 'bg-red-300 bg-opacity-50'; // Invalid move preview
          }

          return (
            <div
              key={`${r}-${c}`}
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border ${cellClass}`}
              onMouseEnter={() => setHoverPos({ x: c, y: r })}
              onClick={() => {
                if(selectedPieceShape) onPlacePiece(c, r);
              }}
            />
          );
        })
      ))}
    </div>
  );
};

export default Board;