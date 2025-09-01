
import { Scene, StoryManifest, StoryManifestInfo, StoryChapter } from '../types';
import { GAMEPLAY, STORY } from '../config';

// Story Registry
const storyManifests: Record<string, StoryManifest> = {};
const chapterCache: Record<string, StoryChapter> = {}; // Key: "storyId/chapterId"

// Active Story State
let activeStoryId: string = STORY.ACTIVE_STORY_ID;
let activeStory: StoryManifest | null = null;
let activeChapter: StoryChapter | null = null;
let gameState: Record<string, any> = {};
let isInitialized = false;

/**
 * Initializes the game service by dynamically discovering and fetching all story manifests.
 * Must be called once before any other service function is used.
 */
export const initializeGameService = async (): Promise<void> => {
    if (isInitialized) return;

    try {
        const indexResponse = await fetch('./stories/index.json');
        if (!indexResponse.ok) throw new Error(`HTTP error! status: ${indexResponse.status}`);
        const storyIds: string[] = await indexResponse.json();

        await Promise.all(storyIds.map(async (storyId) => {
            const path = `./stories/${storyId}/story.json`;
            try {
                const storyResponse = await fetch(path);
                if (!storyResponse.ok) throw new Error(`HTTP error! status: ${storyResponse.status}`);
                const storyData: StoryManifest = await storyResponse.json();
                storyManifests[storyId] = storyData;
            } catch (error) {
                console.error(`Failed to load story manifest "${storyId}" from ${path}:`, error);
            }
        }));
    } catch (error) {
        console.error("Fatal: Failed to load story index '/stories/index.json'.", error);
    }
    
    // Set the active story based on config, with fallback.
    activeStory = storyManifests[activeStoryId];
    if (!activeStory) {
        const fallbackId = Object.keys(storyManifests)[0];
        if (fallbackId) {
            console.warn(`Initial story "${activeStoryId}" not found. Falling back to "${fallbackId}".`);
            activeStoryId = fallbackId;
            activeStory = storyManifests[fallbackId];
        } else {
             throw new Error('Fatal: No stories could be loaded.');
        }
    }
    
    isInitialized = true;
};

const ensureReady = () => {
    if (!isInitialized || !activeStory) {
        throw new Error("Game service is not initialized or no active story is set. This is a critical error in the application startup sequence.");
    }
};

const getChapter = async (storyId: string, chapterId: string): Promise<StoryChapter> => {
    const cacheKey = `${storyId}/${chapterId}`;
    if (chapterCache[cacheKey]) {
        return chapterCache[cacheKey];
    }
    
    ensureReady();
    const manifest = storyManifests[storyId];
    if (!manifest) throw new Error(`Manifest for story "${storyId}" not found.`);
    
    const chapterPath = manifest.chapters[chapterId];
    if (!chapterPath) throw new Error(`Chapter "${chapterId}" not found in manifest for story "${storyId}".`);

    const fullPath = `./stories/${storyId}/${chapterPath.replace('./', '')}`;
    const response = await fetch(fullPath);
    if (!response.ok) throw new Error(`Failed to fetch chapter at ${fullPath}. Status: ${response.status}`);
    
    const chapterData: StoryChapter = await response.json();
    chapterCache[cacheKey] = chapterData;
    return chapterData;
};


/**
 * Checks if a given dialogue line or choice should be displayed based on the current game state.
 * @param condition The condition object from the story data.
 * @returns True if the item should be displayed, false otherwise.
 */
const checkCondition = (condition?: Record<string, any>): boolean => {
    if (!condition) return true; // No condition means it's always visible.

    // Every key in the condition must match the corresponding key in the gameState.
    return Object.keys(condition).every(key => {
        const conditionValue = condition[key];
        const stateValue = gameState[key];

        // If the condition value is null, we check for null or undefined in the game state.
        // This allows the story to check for the absence of a state variable.
        if (conditionValue === null) {
            return stateValue === null || typeof stateValue === 'undefined';
        }

        // Otherwise, we perform a strict equality check.
        return stateValue === conditionValue;
    });
};


/**
 * Retrieves and processes a specific scene from the currently active story.
 * It filters dialogue and choices based on the current `gameState`.
 * This can trigger an on-demand load of a new chapter if the sceneId specifies it.
 * @param sceneId The ID of the scene to retrieve, potentially in "chapterId:sceneId" format.
 * @returns A promise that resolves with the processed scene data.
 */
export const getScene = async (sceneId: string): Promise<Scene> => {
    ensureReady();

    let targetChapterId = activeChapter?.id;
    let targetSceneId = sceneId;

    if (sceneId.includes(':')) {
        [targetChapterId, targetSceneId] = sceneId.split(':');
    }

    if (!targetChapterId) {
        throw new Error(`Cannot determine chapter for sceneId "${sceneId}". No active chapter is set.`);
    }

    const chapter = await getChapter(activeStory!.id, targetChapterId);
    activeChapter = chapter;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const scene = chapter.gameData[targetSceneId];
            if (scene) {
                const processedScene = {
                    ...scene,
                    dialogue: scene.dialogue.filter(d => checkCondition(d.condition)),
                    choices: scene.choices.filter(c => checkCondition(c.condition)),
                };
                resolve(processedScene);
            } else {
                reject(new Error(`Scene with id "${targetSceneId}" not found in chapter "${targetChapterId}" of story "${activeStory!.id}".`));
            }
        }, GAMEPLAY.SCENE_LOAD_DELAY_MS);
    });
};

/**
 * Updates the game state by merging new state properties.
 * @param newState An object containing the state keys and values to update.
 */
export const updateGameState = (newState: Record<string, any>) => {
    gameState = { ...gameState, ...newState };
};

/**
 * Resets the game state to an empty object. Called at the start of a new game.
 */
export const resetGameState = () => {
    gameState = {};
};

/**
 * Retrieves a copy of the current game state.
 * @returns The current game state object.
 */
export const getGameState = (): Record<string, any> => {
    return { ...gameState }; // Return a copy to prevent direct mutation
};

export const getActiveStoryManifest = (): StoryManifest => {
    ensureReady();
    return activeStory!;
}
export const getActiveChapterData = (): StoryChapter | null => activeChapter;

export const getActiveChapter = async (): Promise<StoryChapter | null> => {
    ensureReady();
    if (!activeChapter?.id) return null;
    return getChapter(activeStoryId, activeChapter.id);
}

export const getActiveStoryId = (): string => activeStoryId;

export const getAllStories = (): StoryManifestInfo[] => {
    if (!isInitialized) {
        console.warn("getAllStories called before initialization, returning empty array.");
        return [];
    }
    return Object.values(storyManifests).map(story => ({
        id: story.id,
        metadata: story.metadata,
    }));
};

export const setActiveStory = async (storyId: string): Promise<void> => {
    ensureReady();
    const newStory = storyManifests[storyId];
    if (newStory) {
        activeStoryId = storyId;
        activeStory = newStory;
        activeChapter = await getChapter(storyId, newStory.entryChapter);
        resetGameState(); // Reset state when changing stories
    } else {
        console.error(`Attempted to set active story to a non-existent ID: "${storyId}"`);
    }
};