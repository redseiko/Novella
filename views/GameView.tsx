

import React, { useEffect, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { StoryManifest, StoryChapter } from '../types';
import DialogBox from '../components/DialogBox';
import ChoicesPanel from '../components/ChoicesPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { UI } from '../config';

interface GameViewProps {
    storyManifest: StoryManifest;
    initialChapter: StoryChapter;
    fontSizeClassDialog: string;
    fontSizeClassChoices: string;
    onUpdate: (update: { sceneId?: string; backgroundKey?: string; gameState?: Record<string, any>; chapter?: StoryChapter }) => void;
}

const GameView: React.FC<GameViewProps> = ({ storyManifest, initialChapter, fontSizeClassDialog, fontSizeClassChoices, onUpdate }) => {
    const {
        currentScene,
        dialogueForDisplay,
        isLoading,
        isChoosing,
        isReturning,
        exploredChoices,
        currentGameState,
        currentChapter,
        handleChoiceSelect,
        handleTypingComplete,
        startGame,
    } = useGameState(`${initialChapter.id}:start`);
    
    const [activeChapter, setActiveChapter] = useState(initialChapter);

    useEffect(() => {
        // This effect runs when the story ID changes, restarting the game logic.
        setActiveChapter(initialChapter);
        startGame();
    }, [storyManifest.id, initialChapter, startGame]);

    useEffect(() => {
        // This effect updates the active chapter when useGameState reports a change.
        if (currentChapter && currentChapter.id !== activeChapter.id) {
            setActiveChapter(currentChapter);
        }
    }, [currentChapter, activeChapter.id]);

    useEffect(() => {
        // This effect reports all updates up to the App component.
        onUpdate({
            sceneId: currentScene?.id,
            backgroundKey: currentScene?.backgroundKey,
            gameState: currentGameState,
            chapter: activeChapter
        });
    }, [currentScene, currentGameState, onUpdate, activeChapter]);

    const isInitialLoading = !currentScene && isLoading;

    if (isInitialLoading) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (!currentScene) {
        return null;
    }

    return (
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 lg:p-12 animate-fade-in">
            <div className="w-full max-w-4xl mx-auto space-y-4">
                <div className={UI.CHOICES_PANEL_MIN_HEIGHT}>
                    <ChoicesPanel 
                        choices={currentScene.choices} 
                        onChoiceSelect={handleChoiceSelect}
                        show={isChoosing}
                        fontSizeClass={fontSizeClassChoices}
                        exploredChoices={exploredChoices}
                        disabled={isLoading}
                    />
                </div>
                <DialogBox 
                    sceneId={currentScene.id}
                    dialogue={dialogueForDisplay}
                    onTypingComplete={handleTypingComplete}
                    fontSizeClass={fontSizeClassDialog}
                    isLoading={isLoading}
                    speakerColors={storyManifest.speakerColors}
                    isReturning={isReturning}
                />
            </div>
        </div>
    );
};

export default GameView;