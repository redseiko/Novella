

import React, { useState, useCallback, useEffect } from 'react';
import { UI, DEBUG } from './config';
import { useUISettings } from './hooks/useUISettings';
import { useStoryManager } from './hooks/useStoryManager';
import { StoryChapter } from './types';

import LoadingSpinner from './components/LoadingSpinner';
import SettingsPanel from './components/SettingsPanel';
import DebugPanel from './components/DebugPanel';
import StorySelectionPanel from './components/StorySelectionPanel';
import Background from './components/Background';
import TitleScreenView from './views/TitleScreenView';
import GameView from './views/GameView';
import DocsViewer from './components/DocsViewer';

interface DebugInfo {
    sceneId?: string;
    backgroundKey?: string;
    backgroundType?: string;
    gameState?: Record<string, any>;
    chapterId?: string;
}

interface BackgroundUpdateInfo {
    type: 'image' | 'gradient' | 'default';
}

const App: React.FC = () => {
    const {
        isGameReady,
        storyData,
        allStories,
        showStorySelection,
        setShowStorySelection,
        handleChangeStory,
    } = useStoryManager();

    const {
        fontSizeIndex,
        increaseFontSize,
        decreaseFontSize,
    } = useUISettings();

    const [isGameStarted, setIsGameStarted] = useState(false);
    const [debugInfo, setDebugInfo] = useState<Partial<DebugInfo>>({ gameState: {} });
    const [isDocsVisible, setIsDocsVisible] = useState(false);
    
    useEffect(() => {
        document.documentElement.style.setProperty('--text-outline-style', UI.TEXT_OUTLINE_STYLE);
    }, []);

    const handleBeginGame = useCallback(() => {
        if (!isGameReady) return;
        setIsGameStarted(true);
    }, [isGameReady]);

    const restartGame = useCallback(() => {
        setIsGameStarted(false);
        // Reset debug info for title screen
        setDebugInfo({ gameState: {} });
    }, []);

    // When a new story is selected, change the story data and restart to the title screen.
    const handleStorySelectAndRestart = useCallback((newStoryId: string) => {
        handleChangeStory(newStoryId);
        restartGame();
        setShowStorySelection(false);
    }, [handleChangeStory, restartGame, setShowStorySelection]);
    
    const handleGameUpdate = useCallback((update: Partial<DebugInfo & { chapter?: StoryChapter }>) => {
        setDebugInfo(prev => ({ 
            ...prev, 
            ...update,
            chapterId: update.chapter?.id ?? prev.chapterId,
        }));
    }, []);
    
    const handleBackgroundTypeUpdate = useCallback((info: BackgroundUpdateInfo) => {
        setDebugInfo(prev => ({...prev, backgroundType: info.type}));
    }, []);

    if (!isGameReady || !storyData) {
        return (
            <main className="relative w-screen h-screen overflow-hidden font-sans text-white bg-black flex items-center justify-center">
                <LoadingSpinner />
            </main>
        );
    }
    
    const startSceneBackgroundKey = storyData.chapter.gameData['start']?.backgroundKey ?? 'default';
    const backgroundKey = isGameStarted ? (debugInfo.backgroundKey ?? startSceneBackgroundKey) : 'title-screen';
    
    return (
        <main className="relative w-screen h-screen overflow-hidden font-sans text-white">
            {DEBUG.SHOW_PANEL && <DebugPanel 
                sceneId={debugInfo.sceneId}
                chapterId={isGameStarted ? (debugInfo.chapterId ?? storyData.chapter.id) : 'N/A'}
                backgroundKey={backgroundKey}
                backgroundType={debugInfo.backgroundType}
                gameState={debugInfo.gameState}
            />}
            
            <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
                <button
                    onClick={() => setIsDocsVisible(true)}
                    className="p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="View Documentation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
                <button
                    onClick={() => setShowStorySelection(true)}
                    className="p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Change story"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </button>
                <SettingsPanel 
                    onIncreaseFont={increaseFontSize} 
                    onDecreaseFont={decreaseFontSize}
                    onRestartStory={restartGame}
                />
            </div>
            
            {isDocsVisible && <DocsViewer onClose={() => setIsDocsVisible(false)} />}

            {showStorySelection && (
                <StorySelectionPanel 
                    stories={allStories}
                    activeStoryId={storyData.manifest.id}
                    onSelect={handleStorySelectAndRestart}
                    onClose={() => setShowStorySelection(false)}
                />
            )}
            
            <Background 
                key={`${storyData.manifest.id}-${backgroundKey}`}
                backgroundKey={backgroundKey}
                backgroundsMap={storyData.manifest.backgroundsMap}
                activeStoryId={storyData.manifest.id}
                onUpdate={handleBackgroundTypeUpdate}
            />

            {!isGameStarted ? (
                <TitleScreenView
                    storyMetadata={storyData.manifest.metadata}
                    chapterMetadata={storyData.chapter.metadata}
                    onBeginGame={handleBeginGame}
                    fontSizeClass={UI.FONT_SIZES.dialog[fontSizeIndex]}
                    speakerColors={storyData.manifest.speakerColors}
                />
            ) : (
                <GameView
                    key={storyData.manifest.id} // Re-mounts GameView when story changes
                    storyManifest={storyData.manifest}
                    initialChapter={storyData.chapter}
                    fontSizeClassDialog={UI.FONT_SIZES.dialog[fontSizeIndex]}
                    fontSizeClassChoices={UI.FONT_SIZES.choices[fontSizeIndex]}
                    onUpdate={handleGameUpdate}
                />
            )}
        </main>
    );
};

export default App;