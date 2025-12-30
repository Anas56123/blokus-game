// types.ts
export type PlayerColor = 'blue' | 'yellow' | 'red' | 'green';

export interface Coordinate {
  x: number;
  y: number;
}

// A piece is defined by a list of coordinates relative to (0,0)
export interface PieceDef {
  id: string;
  shape: Coordinate[]; 
  name: string;
}

export interface GameState {
  board: (PlayerColor | null)[][];
  currentPlayerIndex: number;
  players: PlayerColor[];
  hands: Record<PlayerColor, string[]>; // pieces remaining by ID
  scores: Record<PlayerColor, number>;
  selectedPieceId: string | null;
  selectedPieceVariant: Coordinate[] | null; // The rotated/flipped shape
}