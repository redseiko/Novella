import React from 'react';
import { Choice } from '../types';
import { UI } from '../config';

interface ChoicesPanelProps {
  choices: Choice[];
  onChoiceSelect: (choice: Choice) => void;
  show: boolean;
  fontSizeClass: string;
  exploredChoices: Set<string>;
  disabled?: boolean;
}

const ActionIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${UI.CHOICES_ICON_SIZE} text-gray-400 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ExploreIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${UI.CHOICES_ICON_SIZE} text-indigo-300 transition-transform duration-300 group-hover:scale-110 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);


const ChoicesPanel: React.FC<ChoicesPanelProps> = ({ choices, onChoiceSelect, show, fontSizeClass, exploredChoices, disabled = false }) => {
  if (!show || choices.length === 0) {
    return <div className={UI.CHOICES_PANEL_MIN_HEIGHT}></div>; // Placeholder to prevent layout shift
  }

  const sortedChoices = [...choices].sort((a, b) => {
    if (a.type === 'explore' && b.type !== 'explore') return -1;
    if (a.type !== 'explore' && b.type === 'explore') return 1;
    return 0;
  });

  return (
    <div className={`flex flex-col items-start w-full animate-fade-in ${UI.CHOICES_PANEL_SPACING}`}>
      {sortedChoices.map((choice) => {
        const isExplored = choice.type === 'explore' && exploredChoices.has(choice.id);
        const isDisabled = isExplored || disabled;
        return (
          <button
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            disabled={isDisabled}
            className={`group ${UI.CHOICES_BUTTON_WIDTH} font-serif font-medium text-outline px-6 py-3 text-gray-200 transition-all duration-300 ease-in-out ${UI.CHOICES_BUTTON_BG_COLOR} border-2 border-transparent rounded-md backdrop-blur-sm ${UI.CHOICES_BUTTON_HOVER_BG_COLOR} hover:border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-400 flex items-center space-x-4 justify-start ${fontSizeClass} ${isDisabled ? UI.CHOICES_BUTTON_DISABLED_STYLE : ''}`}
          >
            {choice.type === 'explore' ? <ExploreIcon /> : <ActionIcon />}
            <span className="flex-grow text-left">{choice.text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChoicesPanel;