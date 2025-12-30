// utils.ts
import { Coordinate, PlayerColor } from './types';
import { BOARD_SIZE } from './types/constants';

export function createEmptyBoard(): (PlayerColor | null)[][] {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

export function rotateShape(shape: Coordinate[]): Coordinate[] {
  // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
  return shape.map(coord => ({ x: coord.y, y: -coord.x }));
}

export function flipShape(shape: Coordinate[]): Coordinate[] {
  // Flip horizontally: (x, y) -> (-x, y)
  return shape.map(coord => ({ x: -coord.x, y: coord.y }));
}

export function flipX(shape: Coordinate[]): Coordinate[] {
  // Flip horizontally: (x, y) -> (-x, y)
  return shape.map(coord => ({ x: -coord.x, y: coord.y }));
}

export function flipY(shape: Coordinate[]): Coordinate[] {
  // Flip vertically: (x, y) -> (x, -y)
  return shape.map(coord => ({ x: coord.x, y: -coord.y }));
}

export function normalizeShape(shape: Coordinate[]): Coordinate[] {
  // Translate shape so the top-left block is at (0, 0)
  if (shape.length === 0) return shape;
  
  const minX = Math.min(...shape.map(p => p.x));
  const minY = Math.min(...shape.map(p => p.y));
  
  return shape.map(coord => ({
    x: coord.x - minX,
    y: coord.y - minY,
  }));
}

export function isValidMove(
  board: (PlayerColor | null)[][],
  shape: Coordinate[],
  x: number,
  y: number,
  playerColor: PlayerColor
): boolean {
  // Check if all blocks of the shape fit within the board
  for (const block of shape) {
    const boardX = x + block.x;
    const boardY = y + block.y;
    
    if (boardX < 0 || boardX >= BOARD_SIZE || boardY < 0 || boardY >= BOARD_SIZE) {
      return false;
    }
    
    // Check if the cell is already occupied
    if (board[boardY][boardX] !== null) {
      return false;
    }
  }
  
  // Check corner adjacency rule
  // First move: must touch the player's starting corner
  // Subsequent moves: must touch at least one corner of the player's existing pieces
  const isFirstMove = !board.some(row => row.some(cell => cell === playerColor));
  
  if (isFirstMove) {
    // First move must start at the player's corner
    const cornerPositions: Record<PlayerColor, { x: number; y: number }> = {
      blue: { x: 0, y: 0 },
      yellow: { x: BOARD_SIZE - 1, y: 0 },
      red: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 },
      green: { x: 0, y: BOARD_SIZE - 1 },
    };
    
    const corner = cornerPositions[playerColor];
    const touchesCorner = shape.some(block => 
      x + block.x === corner.x && y + block.y === corner.y
    );
    
    if (!touchesCorner) {
      return false;
    }
  } else {
    // Subsequent moves: must touch at least one corner of existing pieces
    let touchesCorner = false;
    
    for (const block of shape) {
      const boardX = x + block.x;
      const boardY = y + block.y;
      
      // Check the 4 diagonal neighbors (corners)
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
          touchesCorner = true;
          break;
        }
      }
      
      if (touchesCorner) break;
    }
    
    if (!touchesCorner) {
      return false;
    }
    
    // Cannot be edge-adjacent to own pieces (only corner-adjacent)
    for (const block of shape) {
      const boardX = x + block.x;
      const boardY = y + block.y;
      
      const edges = [
        { x: boardX - 1, y: boardY },
        { x: boardX + 1, y: boardY },
        { x: boardX, y: boardY - 1 },
        { x: boardX, y: boardY + 1 },
      ];
      
      for (const edge of edges) {
        if (
          edge.x >= 0 && edge.x < BOARD_SIZE &&
          edge.y >= 0 && edge.y < BOARD_SIZE &&
          board[edge.y][edge.x] === playerColor
        ) {
          return false; // Edge-adjacent to own piece is invalid
        }
      }
    }
  }
  
  return true;
}

export function hasValidMoves(
  board: (PlayerColor | null)[][],
  hands: Record<PlayerColor, string[]>,
  playerColor: PlayerColor,
  pieces: Array<{ id: string; shape: Coordinate[] }>
): boolean {
  // Check if player has any valid moves with any of their pieces
  const playerPieces = hands[playerColor];
  
  for (const pieceId of playerPieces) {
    const pieceDef = pieces.find(p => p.id === pieceId);
    if (!pieceDef) continue;
    
    // Try all rotations and flips
    let shape = normalizeShape(pieceDef.shape);
    
    // Try 4 rotations
    for (let rot = 0; rot < 4; rot++) {
      // Try original and flipped versions
      const variants = [
        shape,
        normalizeShape(flipX(shape)),
        normalizeShape(flipY(shape)),
        normalizeShape(flipX(flipY(shape))),
      ];
      
      for (const variant of variants) {
        // Try all positions on the board
        for (let y = 0; y < BOARD_SIZE; y++) {
          for (let x = 0; x < BOARD_SIZE; x++) {
            if (isValidMove(board, variant, x, y, playerColor)) {
              return true;
            }
          }
        }
      }
      
      // Rotate for next iteration
      shape = normalizeShape(rotateShape(shape));
    }
  }
  
  return false;
}

