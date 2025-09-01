

import { useState, useEffect, useCallback } from 'react';
import { StoryManifestInfo, StoryManifest, StoryChapter } from '../types';
import {
    initializeGameService,
    getActiveStoryId,
    getActiveStoryManifest,
    getAllStories,
    setActiveStory,
    getActiveChapterData
} from '../services/gameService';

export interface StoryData {
    manifest: StoryManifest;
    chapter: StoryChapter;
}

export const useStoryManager = () => {
    const [isGameReady, setIsGameReady] = useState<boolean>(false);
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const [allStories, setAllStories] = useState<StoryManifestInfo[]>([]);
    const [showStorySelection, setShowStorySelection] = useState(false);

    const loadStoryData = useCallback(async (storyId: string) => {
        await setActiveStory(storyId);
        const manifest = getActiveStoryManifest();
        const chapter = getActiveChapterData();

        if (manifest && chapter) {
            setStoryData({
                manifest,
                chapter
            });
        } else {
            console.error(`Failed to load manifest or initial chapter for story ${storyId}`);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeGameService();
                const initialStoryId = getActiveStoryId();
                await loadStoryData(initialStoryId);
                setAllStories(getAllStories());
                setIsGameReady(true);
            } catch (error) {
                console.error("Failed to initialize the game:", error);
            }
        };
        init();
    }, [loadStoryData]);

    const handleChangeStory = useCallback((newStoryId: string) => {
        if (!storyData || newStoryId === storyData.manifest.id || !isGameReady) return;
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
