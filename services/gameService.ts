import { Scene, Story, StoryMetadata, StoryInfo, GameData } from '../types';
import { GAMEPLAY, STORY } from '../config';

// Story Registry: A central place to manage all available stories.
const stories: Record<string, Story> = {};

// --- Active Story State ---
let activeStoryId: string = STORY.ACTIVE_STORY_ID;
let activeStory: Story | null = null;
let gameState: Record<string, any> = {};
let isInitialized = false;

/**
 * Initializes the game service by dynamically discovering and fetching all story data.
 * Must be called once before any other service function is used.
 */
export const initializeGameService = async (): Promise<void> => {
    if (isInitialized) return;

    try {
        // 1. Fetch the story index file.
        const indexResponse = await fetch('/stories/index.json');
        if (!indexResponse.ok) throw new Error(`HTTP error! status: ${indexResponse.status}`);
        const storyIds: string[] = await indexResponse.json();

        // 2. Fetch each story listed in the index.
        await Promise.all(storyIds.map(async (storyId) => {
            const path = `/stories/${storyId}/story.json`;
            try {
                const storyResponse = await fetch(path);
                if (!storyResponse.ok) throw new Error(`HTTP error! status: ${storyResponse.status}`);
                const storyData: Story = await storyResponse.json();
                stories[storyId] = storyData;
            // FIX: Add missing curly braces to the catch block.
            } catch (error) {
                console.error(`Failed to load story "${storyId}" from ${path}:`, error);
            }
        }));
    } catch (error) {
        console.error("Fatal: Failed to load story index '/stories/index.json'.", error);
    }
    
    // Set the active story based on config, with fallback.
    activeStory = stories[activeStoryId];
    if (!activeStory) {
        const fallbackId = Object.keys(stories)[0];
        if (fallbackId) {
            console.warn(`Initial story "${activeStoryId}" not found. Falling back to "${fallbackId}".`);
            activeStoryId = fallbackId;
            activeStory = stories[fallbackId];
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

/**
 * Checks if a given dialogue line or choice should be displayed based on the current game state.
 * @param condition The condition object from the story data.
 * @returns True if the item should be displayed, false otherwise.
 */
const checkCondition = (condition?: Record<string, any>): boolean => {
    if (!condition) return true; // No condition means it's always visible.
    // Every key in the condition must match the corresponding key in the gameState.
    return Object.keys(condition).every(key => gameState[key] === condition[key]);
};


/**
 * Retrieves and processes a specific scene from the currently active story.
 * It filters dialogue and choices based on the current `gameState`.
 * @param sceneId The ID of the scene to retrieve.
 * @returns A promise that resolves with the processed scene data.
 */
export const getScene = (sceneId: string): Promise<Scene> => {
  ensureReady();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const scene = activeStory!.gameData[sceneId];
      if (scene) {
        // Process the scene based on the current game state
        const processedScene = {
            ...scene,
            dialogue: scene.dialogue.filter(d => checkCondition(d.condition)),
            choices: scene.choices.filter(c => checkCondition(c.condition)),
        };
        resolve(processedScene);
      } else {
        reject(new Error(`Scene with id "${sceneId}" not found in story "${activeStory!.id}".`));
      }
    }, GAMEPLAY.SCENE_LOAD_DELAY_MS); // Simulate network delay
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

export const getActiveStoryMetadata = (): StoryMetadata => {
    ensureReady();
    return activeStory!.metadata;
};
export const getActiveStorySpeakerColors = (): Record<string, string> => {
    ensureReady();
    return activeStory!.speakerColors;
};
export const getActiveStoryBackgroundsMap = () => {
    ensureReady();
    return activeStory!.backgroundsMap;
};
export const getActiveStoryGameData = (): GameData => {
    ensureReady();
    return activeStory!.gameData;
};
export const getActiveStoryId = (): string => activeStoryId;

export const getAllStories = (): StoryInfo[] => {
    if (!isInitialized) {
        console.warn("getAllStories called before initialization, returning empty array.");
        return [];
    }
    return Object.values(stories).map(story => ({
        id: story.id,
        metadata: story.metadata,
    }));
};

export const setActiveStory = (storyId: string) => {
    ensureReady();
    const newStory = stories[storyId];
    if (newStory) {
        activeStoryId = storyId;
        activeStory = newStory;
        resetGameState(); // Reset state when changing stories
    } else {
        console.error(`Attempted to set active story to a non-existent ID: "${storyId}"`);
    }
};