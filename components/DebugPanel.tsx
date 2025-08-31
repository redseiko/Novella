
import React from 'react';
import { DEBUG } from '../config';

interface DebugPanelProps {
  sceneId?: string;
  backgroundKey?: string;
  backgroundType?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ sceneId, backgroundKey, backgroundType }) => {
  return (
    <div className={`fixed top-4 left-4 z-50 bg-black/50 text-white text-xs font-mono p-2 rounded-lg backdrop-blur-sm border border-gray-700 grid grid-cols-[max-content_auto] ${DEBUG.PANEL_GRID_GUTTER} w-auto max-w-xs`}>
      <span className="text-gray-400">Scene ID</span>
      <span className="font-bold text-yellow-300 truncate">{sceneId || 'N/A'}</span>

      <span className="text-gray-400">Background Key</span>
      <span className="font-bold text-yellow-300 truncate">{backgroundKey || 'N/A'}</span>

      <span className="text-gray-400">Background Type</span>
      <span className="font-bold text-yellow-300 truncate">{backgroundType || 'N/A'}</span>
    </div>
  );
};

export default DebugPanel;