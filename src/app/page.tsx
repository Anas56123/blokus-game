// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PlayerColor, GameState, PlayerConfig } from '../types';
import { PLAYERS, INITIAL_PIECES } from '../types/constants';
import { createEmptyBoard, rotateShape, flipX, flipY, isValidMove, normalizeShape, hasValidMoves } from '../utils';
import { getBotMove } from '../utils/bot';
import Board from '../components/Board';
import BlokusPiece from '../components/BlokusPiece';
import StarterMenu from '../components/StarterMenu';

export default function BlokusGame() {
  const [darkMode, setDarkMode] = useState(false);
  const [showStarterMenu, setShowStarterMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayerIndex: 0,
    players: PLAYERS,
    playerNames: {
      blue: 'Blue Player',
      yellow: 'Yellow Player',
      red: 'Red Player',
      green: 'Green Player',
    },
    playerConfigs: {
      blue: { name: 'Blue Player', isBot: false, botDifficulty: null },
      yellow: { name: 'Yellow Player', isBot: false, botDifficulty: null },
      red: { name: 'Red Player', isBot: false, botDifficulty: null },
      green: { name: 'Green Player', isBot: false, botDifficulty: null },
    },
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
  const currentPlayerConfig = gameState.playerConfigs[currentPlayer];
  const [winner, setWinner] = useState<PlayerColor | null>(null);

  const handleStartGame = (playerConfigs: Record<PlayerColor, PlayerConfig>) => {
    const playerNames: Record<PlayerColor, string> = {
      blue: playerConfigs.blue.name,
      yellow: playerConfigs.yellow.name,
      red: playerConfigs.red.name,
      green: playerConfigs.green.name,
    };

    setGameState({
      board: createEmptyBoard(),
      currentPlayerIndex: 0,
      players: PLAYERS,
      playerNames,
      playerConfigs,
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
    setShowStarterMenu(false);
    setWinner(null);
  };

  // Check for winner - check after each move
  const checkWinner = (hands: Record<PlayerColor, string[]>) => {
    // Check if any player has placed all pieces
    for (const player of PLAYERS) {
      if (hands[player].length === 0) {
        setWinner(player);
        return true;
      }
    }
    return false;
  };


  // Bot move handler
  useEffect(() => {
    if (winner || showStarterMenu) return;
    if (!currentPlayerConfig.isBot) return;

    const timer = setTimeout(() => {
      const botMove = getBotMove(
        gameState.board,
        gameState.hands,
        currentPlayer,
        currentPlayerConfig.botDifficulty
      );

      if (botMove) {
        // Place the bot's piece
        const newBoard = gameState.board.map(row => [...row]);
        botMove.shape.forEach(block => {
          newBoard[botMove.y + block.y][botMove.x + block.x] = currentPlayer;
        });

        const newHand = gameState.hands[currentPlayer].filter(id => id !== botMove.pieceId);
        const newHands = { ...gameState.hands, [currentPlayer]: newHand };

        checkWinner(newHands);

        const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          hands: newHands,
          currentPlayerIndex: nextPlayerIndex,
          selectedPieceId: null,
          selectedPieceVariant: null,
        }));
      } else {
        // Bot has no moves, pass
        setGameState(prev => ({
          ...prev,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % 4,
          selectedPieceId: null,
          selectedPieceVariant: null
        }));
      }
    }, 800); // Delay for bot "thinking"

    return () => clearTimeout(timer);
  }, [gameState.currentPlayerIndex, gameState.board, gameState.hands, currentPlayer, currentPlayerConfig, winner, showStarterMenu]);

  // Check for no valid moves situation
  useEffect(() => {
    if (winner || showStarterMenu) return;
    
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      // Check if all players with pieces remaining have no valid moves
      let allPlayersStuck = true;
      let playersWithPieces = 0;

      for (const player of PLAYERS) {
        // Skip players who have no pieces left
        if (gameState.hands[player].length === 0) {
          continue;
        }
        
        playersWithPieces++;
        const hasMoves = hasValidMoves(
          gameState.board,
          gameState.hands,
          player,
          INITIAL_PIECES
        );

        if (hasMoves) {
          allPlayersStuck = false;
          break;
        }
      }

      // If all players with pieces remaining have no valid moves, game ends
      if (allPlayersStuck && playersWithPieces > 0) {
        // Determine winner: player with fewest pieces remaining (most pieces placed)
        let gameWinner: PlayerColor | null = null;
        let minPieces = Infinity;

        for (const player of PLAYERS) {
          const piecesRemaining = gameState.hands[player].length;
          if (piecesRemaining === 0) {
            // If a player has placed all pieces, they win
            gameWinner = player;
            break;
          } else if (piecesRemaining < minPieces) {
            minPieces = piecesRemaining;
            gameWinner = player;
          }
        }

        if (gameWinner) {
          setWinner(gameWinner);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayerIndex, gameState.board, gameState.hands, winner, showStarterMenu]);

  // Auto-pass if player has no valid moves
  useEffect(() => {
    if (winner || showStarterMenu) return; // Don't auto-pass if game is over or menu is showing
    if (currentPlayerConfig.isBot) return; // Bots handle their own passing
    
    const hasMoves = hasValidMoves(
      gameState.board,
      gameState.hands,
      currentPlayer,
      INITIAL_PIECES
    );

    if (!hasMoves && gameState.hands[currentPlayer].length > 0) {
      // Auto-pass after a short delay to show the state
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % 4,
          selectedPieceId: null,
          selectedPieceVariant: null
        }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerIndex, gameState.board, gameState.hands, currentPlayer, currentPlayerConfig, winner, showStarterMenu]);


  const handleSelectPiece = (id: string) => {
    if (currentPlayerConfig.isBot) return; // Don't allow selecting pieces for bots
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

  const handleFlipX = () => {
    if (gameState.selectedPieceVariant) {
      setGameState(prev => ({
        ...prev,
        selectedPieceVariant: normalizeShape(flipX(prev.selectedPieceVariant!))
      }));
    }
  };

  const handleFlipY = () => {
    if (gameState.selectedPieceVariant) {
      setGameState(prev => ({
        ...prev,
        selectedPieceVariant: normalizeShape(flipY(prev.selectedPieceVariant!))
      }));
    }
  };

  const handlePlacePiece = (x: number, y: number) => {
    if (currentPlayerConfig.isBot) return; // Don't allow manual placement for bots
    const { board, selectedPieceVariant, selectedPieceId, hands, currentPlayerIndex } = gameState;
    
    if (!selectedPieceVariant || !selectedPieceId) return;

    if (isValidMove(board, selectedPieceVariant, x, y, currentPlayer)) {
      // 1. Update Board
      const newBoard = board.map(row => [...row]);
      selectedPieceVariant.forEach(block => {
        newBoard[y + block.y][x + block.x] = currentPlayer;
      });

      // 2. Remove Piece from Hand
      const newHand = hands[currentPlayer].filter(id => id !== selectedPieceId);
      const newHands = { ...hands, [currentPlayer]: newHand };

      // 3. Check for winner
      checkWinner(newHands);

      // 4. Next Turn
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;

      setGameState({
        ...gameState,
        board: newBoard,
        hands: newHands,
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

  const handleResetGame = () => {
    setShowStarterMenu(true);
    setWinner(null);
  };

  const getColorStyles = (color: PlayerColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 border-blue-800 text-blue-100';
      case 'yellow': return 'bg-yellow-400 border-yellow-600 text-yellow-900';
      case 'red': return 'bg-red-600 border-red-800 text-red-100';
      case 'green': return 'bg-green-600 border-green-800 text-green-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-8 font-sans transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {showStarterMenu && (
        <StarterMenu onStart={handleStartGame} darkMode={darkMode} />
      )}

      {!showStarterMenu && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Next.js Blokus</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                darkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 ${getColorStyles(winner)}`}>
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 uppercase">Winner!</h2>
              <div className={`text-6xl font-bold mb-6 uppercase ${getColorStyles(winner)}`}>
                {winner}
              </div>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {gameState.hands[winner].length === 0 
                  ? `${gameState.playerNames[winner]} has placed all their pieces!`
                  : `No players can make any moves. ${gameState.playerNames[winner]} wins with ${gameState.hands[winner].length} piece${gameState.hands[winner].length === 1 ? '' : 's'} remaining!`
                }
              </p>
              <div className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-sm font-semibold mb-2">Final Scores:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PLAYERS.map(p => (
                    <div key={p} className="flex justify-between">
                      <span className="capitalize">{p}:</span>
                      <span>{INITIAL_PIECES.length - gameState.hands[p].length} pieces placed</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleResetGame}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-7xl px-4">
        {/* Left Side: Game Info & Controls */}
        <div className={`flex flex-col gap-4 w-full max-w-xs p-4 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Current Turn: <span className={`uppercase text-${currentPlayer}-600`}>
              {gameState.playerNames[currentPlayer]}
              {currentPlayerConfig.isBot && ' (Bot)'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {PLAYERS.map(p => (
              <div key={p} className={`flex flex-col p-2 rounded ${p === currentPlayer ? (darkMode ? 'bg-gray-700 font-bold' : 'bg-gray-200 font-bold') : (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')} ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <div className="flex justify-between">
                  <span className="capitalize font-semibold">{p}</span>
                  <span>{gameState.hands[p].length} left</span>
                </div>
                <div className="text-xs opacity-75">{gameState.playerNames[p]}</div>
                {gameState.playerConfigs[p].isBot && (
                  <div className="text-xs opacity-60">Bot ({gameState.playerConfigs[p].botDifficulty})</div>
                )}
              </div>
            ))}
          </div>

          {!currentPlayerConfig.isBot && (
            <>
              <div className="flex gap-2">
                <button 
                  onClick={handleRotate} 
                  disabled={!gameState.selectedPieceId}
                  className="flex-1 bg-blue-500 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
                >
                  Rotate
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleFlipX} 
                  disabled={!gameState.selectedPieceId}
                  className="flex-1 bg-purple-500 text-white py-2 rounded disabled:opacity-50 hover:bg-purple-600 transition-colors"
                >
                  Flip X
                </button>
                <button 
                  onClick={handleFlipY} 
                  disabled={!gameState.selectedPieceId}
                  className="flex-1 bg-indigo-500 text-white py-2 rounded disabled:opacity-50 hover:bg-indigo-600 transition-colors"
                >
                  Flip Y
                </button>
              </div>
              <button 
                  onClick={handlePass} 
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Pass Turn
                </button>
            </>
          )}
          {currentPlayerConfig.isBot && (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Bot is thinking...
            </div>
          )}
            
          <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select a piece, then click on the board.
            <br />
            First move must touch your corner.
            <br />
            Subsequent moves must touch corners of your color only.
            <br />
            {!hasValidMoves(gameState.board, gameState.hands, currentPlayer, INITIAL_PIECES) && gameState.hands[currentPlayer].length > 0 && (
              <span className="text-red-500 font-semibold">No valid moves - auto-passing...</span>
            )}
          </div>
        </div>

        {/* Center: The Board */}
        <div className="shrink-0">
          <Board 
            grid={gameState.board} 
            currentPlayer={currentPlayer}
            selectedPieceShape={gameState.selectedPieceVariant}
            onPlacePiece={handlePlacePiece}
            darkMode={darkMode}
          />
        </div>

        {/* Right Side: Player Hand */}
        {!currentPlayerConfig.isBot && (
          <div className={`w-full max-w-xs p-4 rounded-xl shadow-md overflow-y-auto max-h-[600px] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your Pieces</h3>
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
        )}
        {currentPlayerConfig.isBot && (
          <div className={`w-full max-w-xs p-4 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {gameState.playerNames[currentPlayer]}&apos;s Pieces
            </h3>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {gameState.hands[currentPlayer].length} pieces remaining
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}