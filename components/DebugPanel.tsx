

import React from 'react';
import { DEBUG } from '../config';

interface DebugPanelProps {
  sceneId?: string;
  chapterId?: string;
  backgroundKey?: string;
  backgroundType?: string;
  gameState?: Record<string, any>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ sceneId, chapterId, backgroundKey, backgroundType, gameState }) => {
  const gameStateEntries = gameState ? Object.entries(gameState) : [];
  
  return (
    <div className={`fixed top-4 left-4 z-50 bg-black/50 text-white text-xs font-mono p-2 rounded-lg backdrop-blur-sm border border-gray-700 grid grid-cols-[max-content_auto] ${DEBUG.PANEL_GRID_GUTTER} w-auto max-w-xs`}>
      <span className="text-gray-400">Scene ID</span>
      <span className="font-bold text-yellow-300 truncate">{sceneId || 'N/A'}</span>
      
      <span className="text-gray-400">Chapter ID</span>
      <span className="font-bold text-yellow-300 truncate">{chapterId || 'N/A'}</span>

      <span className="text-gray-400">Background Key</span>
      <span className="font-bold text-yellow-300 truncate">{backgroundKey || 'N/A'}</span>

      <span className="text-gray-400">Background Type</span>
      <span className="font-bold text-yellow-300 truncate">{backgroundType || 'N/A'}</span>
      
      {gameStateEntries.length > 0 && (
        <>
            <div className="col-span-2 mt-1 pt-1 border-t border-gray-600">
                <span className="text-gray-400 font-bold">State</span>
            </div>
            {gameStateEntries.map(([key, value]) => (
                <React.Fragment key={key}>
                    <span className="text-gray-400 pl-2">{key}</span>
                    <span className="font-bold text-cyan-300 truncate">{String(value)}</span>
                </React.Fragment>
            ))}
        </>
      )}
    </div>
  );
};

export default DebugPanel;
