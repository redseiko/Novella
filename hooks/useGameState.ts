
import { useState, useCallback, useRef } from 'react';
import { Scene, Choice } from '../types';
import { getScene, updateGameState, resetGameState } from '../services/gameService';

export const useGameState = (initialSceneId: string = 'start') => {
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isChoosing, setIsChoosing] = useState<boolean>(false);
    const [exploredChoices, setExploredChoices] = useState(new Set<string>());
    const [previousSceneChoices, setPreviousSceneChoices] = useState<Choice[] | null>(null);

    // Create refs to hold the latest state values for use in stable callbacks
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const currentSceneRef = useRef(currentScene);
    currentSceneRef.current = currentScene;
    const previousSceneChoicesRef = useRef(previousSceneChoices);
    previousSceneChoicesRef.current = previousSceneChoices;

    const loadScene = useCallback(async (sceneId: string) => {
        setIsLoading(true);
        setIsChoosing(false);

        try {
            const scene = await getScene(sceneId);
            setCurrentScene(scene);
        } catch (error) {
            console.error(`Failed to load scene "${sceneId}":`, error);
            // Optional: Set an error state to display a message to the user
        } finally {
            setIsLoading(false);
        }
    }, []);

    const restartGame = useCallback(() => {
        resetGameState();
        setCurrentScene(null);
        setExploredChoices(new Set<string>());
        setPreviousSceneChoices(null);
        setIsLoading(false);
        setIsChoosing(false);
    }, []);

    const handleChoiceSelect = useCallback((choice: Choice) => {
        if (isLoadingRef.current) return;

        if (choice.setState) {
            updateGameState(choice.setState);
        }

        if (choice.type === 'explore') {
            setPreviousSceneChoices(currentSceneRef.current?.choices ?? []);
            setExploredChoices(prev => new Set(prev).add(choice.id));
            loadScene(choice.nextSceneId);
        } else if (choice.type === 'return') {
            if (previousSceneChoicesRef.current) {
                setCurrentScene(prev => prev ? { ...prev, choices: previousSceneChoicesRef.current! } : null);
                setPreviousSceneChoices(null);
                setIsChoosing(true);
            } else {
                loadScene(choice.nextSceneId);
            }
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

        const scene = currentSceneRef.current;
        if (scene.choices.length === 1 && scene.choices[0].type === 'return') {
            handleChoiceSelect(scene.choices[0]);
        } else {
            setIsChoosing(true);
        }
    }, [handleChoiceSelect]);
    
    // Function to kick off the game. This is now stable and won't cause effect loops.
    const startGame = useCallback(() => {
        if (isLoadingRef.current) return;
        loadScene(initialSceneId);
    }, [loadScene, initialSceneId]);

    return {
        currentScene,
        isLoading,
        isChoosing,
        exploredChoices,
        handleChoiceSelect,
        handleTypingComplete,
        restartGame,
        startGame,
    };
};
