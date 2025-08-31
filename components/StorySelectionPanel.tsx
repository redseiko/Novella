import React from 'react';
import { StoryInfo } from '../types';

interface StorySelectionPanelProps {
  stories: StoryInfo[];
  activeStoryId: string;
  onSelect: (storyId: string) => void;
  onClose: () => void;
}

const StorySelectionPanel: React.FC<StorySelectionPanelProps> = ({ stories, activeStoryId, onSelect, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-selection-title"
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 id="story-selection-title" className="text-xl font-bold text-white font-sans">Change Story</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-2">
            {stories.map((story) => {
                const isActive = story.id === activeStoryId;
                return (
                    <button
                        key={story.id}
                        onClick={() => onSelect(story.id)}
                        disabled={isActive}
                        className={`w-full p-4 rounded-md text-left transition-colors font-sans group ${isActive ? 'bg-indigo-800/50 cursor-default' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <h3 className={`font-bold text-lg ${isActive ? 'text-indigo-200' : 'text-white'}`}>{story.metadata.title}</h3>
                        <p className={`text-sm ${isActive ? 'text-indigo-300' : 'text-gray-400'}`}>{story.metadata.chapter}</p>
                    </button>
                )
            })}
        </div>
        <div className="p-2 border-t border-gray-700 flex justify-end flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorySelectionPanel;