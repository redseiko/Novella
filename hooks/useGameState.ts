

import { useState, useCallback, useRef } from 'react';
import { Scene, Choice, StoryChapter, DialogueLine } from '../types';
import { getScene, updateGameState, resetGameState, getGameState, getActiveChapterData } from '../services/gameService';

export const useGameState = (initialSceneId: string = 'start') => {
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [dialogueForDisplay, setDialogueForDisplay] = useState<DialogueLine[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isChoosing, setIsChoosing] = useState<boolean>(false);
    const [exploredChoices, setExploredChoices] = useState(new Set<string>());
    const [previousSceneChoices, setPreviousSceneChoices] = useState<Choice[] | null>(null);
    const [currentGameState, setCurrentGameState] = useState<Record<string, any>>({});
    const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
    const [isReturning, setIsReturning] = useState(false);

    // Create refs to hold the latest state values for use in stable callbacks
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const currentSceneRef = useRef(currentScene);
    currentSceneRef.current = currentScene;

    const loadScene = useCallback(async (sceneId: string, options?: { isReturning?: boolean }) => {
        setIsLoading(true);
        setIsReturning(!!options?.isReturning);
        setIsChoosing(false); // Always hide choices during any scene transition

        try {
            const scene = await getScene(sceneId);
            setCurrentScene(scene);
            setCurrentChapter(getActiveChapterData());

            if (!options?.isReturning) {
                // Only update the dialogue to be displayed for brand new scenes.
                // On a return, this is skipped, preserving the old dialogue text.
                setDialogueForDisplay(scene.dialogue);
            }
        } catch (error) {
            console.error(`Failed to load scene "${sceneId}":`, error);
            // Optional: Set an error state to display a message to the user
        } finally {
            setIsLoading(false);
        }
    }, []);

    const restartGame = useCallback(() => {
        resetGameState();
        setCurrentGameState({});
        setCurrentScene(null);
        setDialogueForDisplay([]);
        setCurrentChapter(null);
        setExploredChoices(new Set<string>());
        setPreviousSceneChoices(null);
        setIsLoading(true);
        setIsChoosing(false);
    }, []);

    const handleChoiceSelect = useCallback((choice: Choice) => {
        if (isLoadingRef.current) return;

        if (choice.setState) {
            updateGameState(choice.setState);
            setCurrentGameState(getGameState()); // Update local state from service
        }

        if (choice.type === 'explore') {
            setPreviousSceneChoices(currentSceneRef.current?.choices ?? []);
            setExploredChoices(prev => new Set(prev).add(choice.id));
            loadScene(choice.nextSceneId);
        } else if (choice.type === 'return') {
            loadScene(choice.nextSceneId, { isReturning: true });
        } else { // 'action' type or undefined
            setExploredChoices(new Set());
            setPreviousSceneChoices(null);
            loadScene(choice.nextSceneId);
        }
    }, [loadScene]);
    
    const handleTypingComplete = useCallback(() => {
        if (isLoadingRef.current || !currentSceneRef.current?.choices?.length) {
            return;
        }

        // This callback is triggered by DialogBox either after typing is finished,
        // or immediately on a 'return' transition.
        setIsChoosing(true);
    }, []);
    
    // Function to kick off the game.
    const startGame = useCallback(() => {
        restartGame();
        setCurrentGameState(getGameState());
        loadScene(initialSceneId);
    }, [loadScene, initialSceneId, restartGame]);

    return {
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
        restartGame,
        startGame,
    };
};