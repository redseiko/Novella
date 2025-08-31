
import React, { useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { StoryData } from '../hooks/useStoryManager';
import DialogBox from '../components/DialogBox';
import ChoicesPanel from '../components/ChoicesPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { UI } from '../config';

interface GameViewProps {
    storyData: StoryData;
    fontSizeClassDialog: string;
    fontSizeClassChoices: string;
    onUpdate: (update: { sceneId?: string; backgroundKey?: string; }) => void;
}

const GameView: React.FC<GameViewProps> = ({ storyData, fontSizeClassDialog, fontSizeClassChoices, onUpdate }) => {
    const {
        currentScene,
        isLoading,
        isChoosing,
        exploredChoices,
        handleChoiceSelect,
        handleTypingComplete,
        startGame,
    } = useGameState('start');
    
    useEffect(() => {
        startGame();
    }, [storyData.id, startGame]);

    useEffect(() => {
        onUpdate({
            sceneId: currentScene?.id,
            backgroundKey: currentScene?.backgroundKey,
        });
    }, [currentScene, onUpdate]);

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
                    dialogue={currentScene.dialogue}
                    onTypingComplete={handleTypingComplete}
                    fontSizeClass={fontSizeClassDialog}
                    isLoading={isLoading}
                    speakerColors={storyData.speakerColors}
                />
            </div>
        </div>
    );
};

export default GameView;
