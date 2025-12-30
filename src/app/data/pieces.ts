// src/data/pieces.ts (A simplified example for the first few pieces)

import { Piece } from '../types/game';
import { generateAllRotations } from '../utils/pieceUtils'; // You would create this utility

const basePieces: Omit<Piece, 'rotations'>[] = [
  // 1-square piece
  { id: 1, size: 1, shape: [[true]] },
  
  // 2-square piece (Domino)
  { id: 2, size: 2, shape: [[true, true]] },

  // 3-square pieces
  { id: 3, size: 3, shape: [[true, true, true]] }, // Straight line
  { id: 4, size: 3, shape: [[true, true], [false, true]] }, // L-shape

  // ... 17 more pieces ...
];

// Helper function (you need to implement this)
// This function takes a shape and returns all 8 unique rotation/flip variations.
// const generateAllRotations = (shape: boolean[][]) => { /* ... implementation ... */ };


export const ALL_PIECES: Piece[] = basePieces.map(piece => ({
  ...piece,
  rotations: generateAllRotations(piece.shape),
}));