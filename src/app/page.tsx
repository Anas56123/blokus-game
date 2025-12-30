// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PlayerColor, Coordinate, GameState } from '../types';
import { PLAYERS, INITIAL_PIECES, BOARD_SIZE } from '../constants';
import { createEmptyBoard, rotateShape, flipShape, isValidMove, normalizeShape } from '../utils';
import Board from '../components/Board';
import BlokusPiece from '../components/BlokusPiece';

export default function BlokusGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayerIndex: 0,
    players: PLAYERS,
    hands: {
      blue: INITIAL_PIECES.map(p => p.id),
      yellow: INITIAL_PIECES.map(p => p.id),
      red: INITIAL_PIECES.map(p => p.id),
      green: INITIAL_PIECES.map(p => p.id),
    },
    scores: { blue: 0, yellow: 0, red: 0, green: 0 },
    selectedPieceId: null,
    selectedPieceVariant: null,
  });

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Utility to update score
  const calculateScore = (handIds: string[]) => {
    // Basic scoring: -1 per unit square remaining. 
    // Usually standard is: 89 points total if clear. Here we just count placed squares.
    // For simplicity, let's just show remaining pieces count.
    return handIds.length; 
  };

  const handleSelectPiece = (id: string) => {
    const pieceDef = INITIAL_PIECES.find(p => p.id === id);
    if (pieceDef) {
      setGameState(prev => ({
        ...prev,
        selectedPieceId: id,
        selectedPieceVariant: normalizeShape(pieceDef.shape),
      }));
    }
  };

  const handleRotate = () => {
    if (gameState.selectedPieceVariant) {
      setGameState(prev => ({
        ...prev,
        selectedPieceVariant: normalizeShape(rotateShape(prev.selectedPieceVariant!))
      }));
    }
  };

  const handleFlip = () => {
    if (gameState.selectedPieceVariant) {
      setGameState(prev => ({
        ...prev,
        selectedPieceVariant: normalizeShape(flipShape(prev.selectedPieceVariant!))
      }));
    }
  };

  const handlePlacePiece = (x: number, y: number) => {
    const { board, selectedPieceVariant, selectedPieceId, hands, currentPlayerIndex, players } = gameState;
    
    if (!selectedPieceVariant || !selectedPieceId) return;

    if (isValidMove(board, selectedPieceVariant, x, y, currentPlayer)) {
      // 1. Update Board
      const newBoard = board.map(row => [...row]);
      selectedPieceVariant.forEach(block => {
        newBoard[y + block.y][x + block.x] = currentPlayer;
      });

      // 2. Remove Piece from Hand
      const newHand = hands[currentPlayer].filter(id => id !== selectedPieceId);

      // 3. Next Turn
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;

      setGameState({
        ...gameState,
        board: newBoard,
        hands: { ...hands, [currentPlayer: newHand] },
        currentPlayerIndex: nextPlayerIndex,
        selectedPieceId: null,
        selectedPieceVariant: null,
      });
    } else {
      alert("Invalid Move!");
    }
  };

  const handlePass = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % 4,
      selectedPieceId: null,
      selectedPieceVariant: null
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">Next.js Blokus</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Game Info & Controls */}
        <div className="flex flex-col gap-4 w-full max-w-xs bg-white p-4 rounded-xl shadow-md">
          <div className="text-xl font-semibold">
            Current Turn: <span className={`uppercase text-${currentPlayer}-600`}>{currentPlayer}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {PLAYERS.map(p => (
              <div key={p} className={`flex justify-between p-2 rounded ${p === currentPlayer ? 'bg-gray-200 font-bold' : ''}`}>
                <span className="capitalize">{p}</span>
                <span>{gameState.hands[p].length} left</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleRotate} 
              disabled={!gameState.selectedPieceId}
              className="flex-1 bg-blue-500 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-600"
            >
              Rotate (R)
            </button>
            <button 
              onClick={handleFlip} 
              disabled={!gameState.selectedPieceId}
              className="flex-1 bg-purple-500 text-white py-2 rounded disabled:opacity-50 hover:bg-purple-600"
            >
              Flip (F)
            </button>
          </div>
          <button 
              onClick={handlePass} 
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Pass Turn
            </button>
            
          <div className="text-xs text-gray-500 mt-2">
            Select a piece, then click on the board.
            <br />
            First move must touch your corner.
            <br />
            Subsequent moves must touch corners of your color only.
          </div>
        </div>

        {/* Center: The Board */}
        <Board 
          grid={gameState.board} 
          currentPlayer={currentPlayer}
          selectedPieceShape={gameState.selectedPieceVariant}
          onPlacePiece={handlePlacePiece}
        />

        {/* Right Side: Player Hand */}
        <div className="w-full max-w-xs bg-white p-4 rounded-xl shadow-md overflow-y-auto max-h-[600px]">
          <h3 className="font-bold mb-2">Your Pieces</h3>
          <div className="flex flex-wrap gap-2">
            {gameState.hands[currentPlayer].map(pieceId => {
              const pieceDef = INITIAL_PIECES.find(p => p.id === pieceId);
              if(!pieceDef) return null;
              return (
                <BlokusPiece 
                  key={pieceId}
                  shape={pieceDef.shape}
                  color={currentPlayer}
                  isSelected={gameState.selectedPieceId === pieceId}
                  onClick={() => handleSelectPiece(pieceId)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}