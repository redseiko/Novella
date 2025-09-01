import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DialogueLine } from '../types';
import { UI, GAMEPLAY } from '../config';

interface DialogBoxProps {
  sceneId: string;
  dialogue: DialogueLine[];
  onTypingComplete: () => void;
  fontSizeClass: string;
  isLoading: boolean;
  speakerColors: Record<string, string>;
  isReturning?: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({ sceneId, dialogue, onTypingComplete, fontSizeClass, isLoading, speakerColors, isReturning = false }) => {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isParagraphComplete, setIsParagraphComplete] = useState(false);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTypingAnimation = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, []);

  // Effect to set up the scene's dialogue state
  useEffect(() => {
    // This effect handles resetting the dialogue box for new scenes,
    // or triggering choices to show when returning to a previous scene.
    if (isReturning) {
        // When returning, we don't change the text. We just need to signal
        // that the choices for the *new* scene should be displayed.
        stopTypingAnimation();
        onTypingComplete();
    } else {
        // For any new scene, reset the state to begin the typing animation.
        stopTypingAnimation();
        if (dialogue && dialogue.length > 0) {
            setParagraphIndex(0);
            setDisplayedText('');
            setIsParagraphComplete(false);
        } else {
            // If there's no dialogue in the new scene, immediately show choices.
            onTypingComplete();
        }
    }
  }, [sceneId, isReturning]); // Keying off sceneId change and return status is crucial here.

  // Effect to run the typing animation
  useEffect(() => {
    // Do not start typing if we're returning or loading a new scene.
    if (isReturning || isLoading || !dialogue || !dialogue[paragraphIndex]) {
      return;
    }

    // if paragraph is already complete from a user click-skip, don't re-animate
    if (isParagraphComplete && displayedText === dialogue[paragraphIndex].line) {
        return;
    }

    stopTypingAnimation();

    let i = 0;
    // Ensure we start fresh for the current paragraph
    setDisplayedText('');
    setIsParagraphComplete(false);

    const currentParagraphLine = dialogue[paragraphIndex].line;

    const intervalId = setInterval(() => {
      setDisplayedText(currentParagraphLine.substring(0, i + 1));
      i++;
      if (i > currentParagraphLine.length) {
        stopTypingAnimation();
        setIsParagraphComplete(true);
        if (paragraphIndex === dialogue.length - 1) {
          onTypingComplete();
        }
      }
    }, GAMEPLAY.TYPING_SPEED_MS);

    typingIntervalRef.current = intervalId;

    return () => stopTypingAnimation();
  }, [dialogue, paragraphIndex, onTypingComplete, stopTypingAnimation, isLoading, isReturning]);


  const handleInteraction = () => {
    if (isLoading) return;

    if (!isParagraphComplete) {
      stopTypingAnimation();
      setDisplayedText(dialogue[paragraphIndex].line);
      setIsParagraphComplete(true);
      if (paragraphIndex === dialogue.length - 1) {
        onTypingComplete();
      }
    } else if (paragraphIndex < dialogue.length - 1) {
      setParagraphIndex(prev => prev + 1);
    }
  };

  const showContinueIndicator = isParagraphComplete && paragraphIndex < dialogue.length - 1 && !isLoading;
  const currentParagraphData = dialogue[paragraphIndex] || dialogue[dialogue.length - 1];
  const currentSpeaker = currentParagraphData?.speaker;

  const hasSpeaker = currentSpeaker && currentSpeaker.length > 0;
  const speakerColorClass = hasSpeaker
    ? (speakerColors[currentSpeaker] || speakerColors['default'])
    : 'text-transparent';

  return (
    <div 
      className={`${UI.DIALOG_BOX_BG_COLOR} border-t-2 border-gray-500/50 p-6 rounded-lg cursor-pointer relative flex flex-col ${UI.DIALOG_BOX_MIN_HEIGHT}`}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleInteraction()}
      aria-live="polite"
      aria-atomic="true"
    >
      <div>
        <span className={`block font-bold font-sans text-center transition-colors duration-300 text-outline ${UI.DIALOG_BOX_SPEAKER_MARGIN} ${fontSizeClass} ${speakerColorClass}`}>
          {hasSpeaker ? currentSpeaker : '\u00A0' /* Non-breaking space to preserve height */}
        </span>
        <p className={`font-serif text-gray-200 leading-snug font-medium text-outline ${fontSizeClass}`}>
          {displayedText}
          {!isParagraphComplete && !isLoading && <span className="inline-block w-2 h-5 ml-1 bg-gray-200 animate-pulse" />}
        </p>
      </div>
      {showContinueIndicator && (
        <div className="absolute bottom-4 right-6 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      )}
    </div>
  );
};

export default DialogBox;