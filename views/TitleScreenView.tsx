
import React from 'react';
import { DialogueLine, StoryMetadata } from '../types';
import { UI } from '../config';
import TitleScreen from '../components/TitleScreen';
import DialogBox from '../components/DialogBox';

const TITLE_SCREEN_DIALOGUE: DialogueLine[] = [{ speaker: '', line: "Click anywhere to begin." }];
const EMPTY_FUNC = () => {};

interface TitleScreenViewProps {
    storyMetadata: StoryMetadata;
    onBeginGame: () => void;
    fontSizeClass: string;
    speakerColors: Record<string, string>;
}

const TitleScreenView: React.FC<TitleScreenViewProps> = ({ storyMetadata, onBeginGame, fontSizeClass, speakerColors }) => {
    return (
        <div 
            className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 lg:p-12 cursor-pointer animate-fade-in"
            onClick={onBeginGame}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onBeginGame()}
            aria-label="Begin Game"
        >
            <div className="w-full max-w-4xl mx-auto space-y-4">
                <div className={`${UI.CHOICES_PANEL_MIN_HEIGHT} flex items-center justify-center`}>
                    <TitleScreen title={storyMetadata.title} chapter={storyMetadata.chapter} />
                </div>
                <DialogBox 
                    sceneId="title-screen"
                    dialogue={TITLE_SCREEN_DIALOGUE}
                    onTypingComplete={EMPTY_FUNC}
                    fontSizeClass={fontSizeClass}
                    isLoading={false}
                    speakerColors={speakerColors}
                />
            </div>
        </div>
    );
};

export default TitleScreenView;
