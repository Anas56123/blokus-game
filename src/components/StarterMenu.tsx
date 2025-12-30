// components/StarterMenu.tsx
import React, { useState } from 'react';
import { PlayerColor, BotDifficulty, PlayerConfig } from '../types';
import { PLAYERS } from '../types/constants';

interface StarterMenuProps {
  onStart: (playerConfigs: Record<PlayerColor, PlayerConfig>) => void;
  darkMode: boolean;
}

const StarterMenu: React.FC<StarterMenuProps> = ({ onStart, darkMode }) => {
  const [playerConfigs, setPlayerConfigs] = useState<Record<PlayerColor, PlayerConfig>>({
    blue: { name: 'Blue Player', isBot: false, botDifficulty: null },
    yellow: { name: 'Yellow Player', isBot: false, botDifficulty: null },
    red: { name: 'Red Player', isBot: false, botDifficulty: null },
    green: { name: 'Green Player', isBot: false, botDifficulty: null },
  });

  const updatePlayerConfig = (color: PlayerColor, updates: Partial<PlayerConfig>) => {
    setPlayerConfigs(prev => ({
      ...prev,
      [color]: { ...prev[color], ...updates },
    }));
  };

  const handleStart = () => {
    onStart(playerConfigs);
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
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl`}>
        <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Game Setup
        </h2>
        
        <div className="space-y-4 mb-6">
          {PLAYERS.map(color => {
            const config = playerConfigs[color];
            return (
              <div
                key={color}
                className={`p-4 rounded-lg border-2 ${getColorStyles(color)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className={`block text-sm font-semibold mb-2 ${color === 'yellow' ? 'text-yellow-900' : 'text-white'}`}>
                      {color.charAt(0).toUpperCase() + color.slice(1)} Player Name
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updatePlayerConfig(color, { name: e.target.value })}
                      disabled={config.isBot}
                      className={`w-full px-3 py-2 rounded ${
                        config.isBot 
                          ? `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} cursor-not-allowed` 
                          : darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
                      } border ${color === 'yellow' ? 'border-yellow-700' : 'border-white/30'}`}
                      placeholder={`Enter ${color} player name`}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className={`text-sm font-semibold ${color === 'yellow' ? 'text-yellow-900' : 'text-white'}`}>
                      Bot?
                    </label>
                    <input
                      type="checkbox"
                      checked={config.isBot}
                      onChange={(e) => {
                        const isBot = e.target.checked;
                        updatePlayerConfig(color, {
                          isBot,
                          botDifficulty: isBot ? 'medium' : null,
                          name: isBot ? `Bot (${color})` : `${color.charAt(0).toUpperCase() + color.slice(1)} Player`,
                        });
                      }}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
                
                {config.isBot && (
                  <div className="mt-3">
                    <label className={`block text-sm font-semibold mb-2 ${color === 'yellow' ? 'text-yellow-900' : 'text-white'}`}>
                      Bot Difficulty
                    </label>
                    <select
                      value={config.botDifficulty || 'medium'}
                      onChange={(e) => updatePlayerConfig(color, { botDifficulty: e.target.value as BotDifficulty })}
                      className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} border ${color === 'yellow' ? 'border-yellow-700' : 'border-white/30'}`}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleStart}
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StarterMenu;

