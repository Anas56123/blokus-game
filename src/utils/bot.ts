// bot.ts - Bot AI implementation
import { Coordinate, PlayerColor, BotDifficulty } from '../types';
import { BOARD_SIZE, INITIAL_PIECES } from '../types/constants';
import { isValidMove, normalizeShape, rotateShape, flipX, flipY } from '../utils';

export interface BotMove {
  pieceId: string;
  shape: Coordinate[];
  x: number;
  y: number;
}

export function getBotMove(
  board: (PlayerColor | null)[][],
  hands: Record<PlayerColor, string[]>,
  playerColor: PlayerColor,
  difficulty: BotDifficulty
): BotMove | null {
  if (difficulty === null) return null;

  const playerPieces = hands[playerColor];
  if (playerPieces.length === 0) return null;

  const allMoves: Array<BotMove & { score: number }> = [];

  // Generate all possible moves
  for (const pieceId of playerPieces) {
    const pieceDef = INITIAL_PIECES.find(p => p.id === pieceId);
    if (!pieceDef) continue;

    let shape = normalizeShape(pieceDef.shape);

    // Try 4 rotations
    for (let rot = 0; rot < 4; rot++) {
      // Try original and flipped versions
      const variants = [
        { shape: shape, name: 'original' },
        { shape: normalizeShape(flipX(shape)), name: 'flipX' },
        { shape: normalizeShape(flipY(shape)), name: 'flipY' },
        { shape: normalizeShape(flipX(flipY(shape))), name: 'flipXY' },
      ];

      for (const variant of variants) {
        // Try all positions on the board
        for (let y = 0; y < BOARD_SIZE; y++) {
          for (let x = 0; x < BOARD_SIZE; x++) {
            if (isValidMove(board, variant.shape, x, y, playerColor)) {
              const score = evaluateMove(board, variant.shape, x, y, playerColor, difficulty);
              allMoves.push({
                pieceId,
                shape: variant.shape,
                x,
                y,
                score,
              });
            }
          }
        }
      }

      // Rotate for next iteration
      shape = normalizeShape(rotateShape(shape));
    }
  }

  if (allMoves.length === 0) return null;

  // Select move based on difficulty
  switch (difficulty) {
    case 'easy':
      // Random move
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    
    case 'medium':
      // Prefer moves that place larger pieces, but with some randomness
      const sortedMedium = allMoves.sort((a, b) => {
        const sizeA = a.shape.length;
        const sizeB = b.shape.length;
        if (sizeA !== sizeB) return sizeB - sizeA;
        return Math.random() - 0.3; // 30% chance to pick randomly
      });
      return sortedMedium[0];
    
    case 'hard':
      // Best move based on scoring
      const sortedHard = allMoves.sort((a, b) => b.score - a.score);
      return sortedHard[0];
    
    default:
      return allMoves[0];
  }
}

function evaluateMove(
  board: (PlayerColor | null)[][],
  shape: Coordinate[],
  x: number,
  y: number,
  playerColor: PlayerColor,
  difficulty: BotDifficulty
): number {
  let score = 0;

  // Prefer larger pieces (more squares placed)
  score += shape.length * 10;

  // Prefer placing pieces near corners (strategic positioning)
  const isFirstMove = !board.some(row => row.some(cell => cell === playerColor));
  if (!isFirstMove) {
    // Check how many corners this move touches
    let cornerTouches = 0;
    for (const block of shape) {
      const boardX = x + block.x;
      const boardY = y + block.y;
      
      const corners = [
        { x: boardX - 1, y: boardY - 1 },
        { x: boardX + 1, y: boardY - 1 },
        { x: boardX - 1, y: boardY + 1 },
        { x: boardX + 1, y: boardY + 1 },
      ];
      
      for (const corner of corners) {
        if (
          corner.x >= 0 && corner.x < BOARD_SIZE &&
          corner.y >= 0 && corner.y < BOARD_SIZE &&
          board[corner.y][corner.x] === playerColor
        ) {
          cornerTouches++;
        }
      }
    }
    score += cornerTouches * 5;
  }

  // Prefer center positions (hard difficulty)
  if (difficulty === 'hard') {
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    for (const block of shape) {
      const boardX = x + block.x;
      const boardY = y + block.y;
      const distFromCenter = Math.sqrt(
        Math.pow(boardX - centerX, 2) + Math.pow(boardY - centerY, 2)
      );
      score += (BOARD_SIZE - distFromCenter) * 0.5;
    }
  }

  // Prefer blocking opponent moves (hard difficulty)
  if (difficulty === 'hard') {
    // Check if this move blocks potential opponent positions
    // This is simplified - a full implementation would check all opponent pieces
    score += Math.random() * 2; // Small random factor
  }

  return score;
}

