// components/Board.tsx
import React, { useState } from 'react';
import { PlayerColor, Coordinate } from '../types';
import { BOARD_SIZE, PLAYERS } from '../types/constants';
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

  // Get corner positions for each player
  const getCornerPosition = (color: PlayerColor) => {
    switch (color) {
      case 'blue': return { x: 0, y: 0 };
      case 'yellow': return { x: BOARD_SIZE - 1, y: 0 };
      case 'red': return { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };
      case 'green': return { x: 0, y: BOARD_SIZE - 1 };
    }
  };

  const isCornerCell = (r: number, c: number): PlayerColor | null => {
    for (const player of PLAYERS) {
      const corner = getCornerPosition(player);
      if (corner.x === c && corner.y === r) {
        return player;
      }
    }
    return null;
  };

  return (
    <div 
      className={`grid gap-px border-2 p-1 select-none relative ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-400 border-gray-800'}`}
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
          const cornerPlayer = isCornerCell(r, c);
          let cellClass = getColorClass(cell);

          if (isGhost && cell === null) {
             cellClass = isHoverValid 
               ? `bg-opacity-50 ${getColorClass(currentPlayer)}` // Valid move preview
               : 'bg-red-300 bg-opacity-50'; // Invalid move preview
          }

          return (
            <div
              key={`${r}-${c}`}
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border ${cellClass} relative`}
              onMouseEnter={() => setHoverPos({ x: c, y: r })}
              onClick={() => {
                if(selectedPieceShape) onPlacePiece(c, r);
              }}
            >
              {cornerPlayer && cell === null && (
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                  cornerPlayer === 'yellow' ? 'text-yellow-900' : 'text-white'
                }`}>
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    cornerPlayer === 'blue' ? 'bg-blue-600 border-blue-800' :
                    cornerPlayer === 'yellow' ? 'bg-yellow-400 border-yellow-600' :
                    cornerPlayer === 'red' ? 'bg-red-600 border-red-800' :
                    'bg-green-600 border-green-800'
                  }`} />
                </div>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default Board;