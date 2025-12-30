// components/BlokusPiece.tsx
import React from 'react';
import { Coordinate, PlayerColor } from '../types';

interface BlokusPieceProps {
  shape: Coordinate[];
  color: PlayerColor;
  onClick?: () => void;
  isSelected?: boolean;
}

const BlokusPiece: React.FC<BlokusPieceProps> = ({ shape, color, onClick, isSelected }) => {
  // Calculate bounding box to render SVG
  const minX = Math.min(...shape.map(p => p.x));
  const maxX = Math.max(...shape.map(p => p.x));
  const minY = Math.min(...shape.map(p => p.y));
  const maxY = Math.max(...shape.map(p => p.y));
  
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  const colorMap: Record<PlayerColor, string> = {
    blue: 'fill-blue-500',
    yellow: 'fill-yellow-400',
    red: 'fill-red-500',
    green: 'fill-green-500',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-1 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'hover:scale-105'}`}
    >
      <svg 
        viewBox={`${minX} ${minY} ${width} ${height}`} 
        className={`w-12 h-12 ${colorMap[color]} stroke-black stroke-[0.1]`}
      >
        {shape.map((block, i) => (
          <rect key={i} x={block.x} y={block.y} width="1" height="1" />
        ))}
      </svg>
    </div>
  );
};

export default BlokusPiece;