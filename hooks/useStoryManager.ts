
import { useState, useEffect, useCallback } from 'react';
import { StoryInfo, StoryMetadata, GameData } from '../types';
import {
    initializeGameService,
    getActiveStoryId,
    getActiveStoryMetadata,
    getActiveStorySpeakerColors,
    getActiveStoryBackgroundsMap,
    getActiveStoryGameData,
    getAllStories,
    setActiveStory,
} from '../services/gameService';

export interface StoryData {
    id: string;
    metadata: StoryMetadata;
    speakerColors: Record<string, string>;
    backgroundsMap: Record<string, { from: string; to: string }>;
    gameData: GameData;
}

export const useStoryManager = () => {
    const [isGameReady, setIsGameReady] = useState<boolean>(false);
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const [allStories, setAllStories] = useState<StoryInfo[]>([]);
    const [showStorySelection, setShowStorySelection] = useState(false);

    const loadStoryData = useCallback((storyId: string) => {
        setActiveStory(storyId);
        setStoryData({
            id: getActiveStoryId(),
            metadata: getActiveStoryMetadata(),
            speakerColors: getActiveStorySpeakerColors(),
            backgroundsMap: getActiveStoryBackgroundsMap(),
            gameData: getActiveStoryGameData(),
        });
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeGameService();
                const initialStoryId = getActiveStoryId();
                setStoryData({
                    id: initialStoryId,
                    metadata: getActiveStoryMetadata(),
                    speakerColors: getActiveStorySpeakerColors(),
                    backgroundsMap: getActiveStoryBackgroundsMap(),
                    gameData: getActiveStoryGameData(),
                });
                setAllStories(getAllStories());
                setIsGameReady(true);
            } catch (error) {
                console.error("Failed to initialize the game:", error);
            }
        };
        init();
    }, []);

    const handleChangeStory = useCallback((newStoryId: string) => {
        if (!storyData || newStoryId === storyData.id || !isGameReady) return;
        loadStoryData(newStoryId);
    }, [storyData, isGameReady, loadStoryData]);

    return {
        isGameReady,
        storyData,
        allStories,
        showStorySelection,
        setShowStorySelection,
        handleChangeStory,
    };
};