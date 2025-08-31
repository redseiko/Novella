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
}

const DialogBox: React.FC<DialogBoxProps> = ({ sceneId, dialogue, onTypingComplete, fontSizeClass, isLoading, speakerColors }) => {
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

  // This effect resets the state ONLY when the scene ID changes.
  // This is the key to preventing re-animation when choices are restored.
  useEffect(() => {
    setParagraphIndex(0);
    setDisplayedText('');
    setIsParagraphComplete(false);
  }, [sceneId]);

  useEffect(() => {
    stopTypingAnimation();

    const currentParagraph = dialogue[paragraphIndex];
    if (!currentParagraph || isLoading) return;

    setIsParagraphComplete(false);
    setDisplayedText('');

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(currentParagraph.line.substring(0, i + 1));
      i++;
      if (i > currentParagraph.line.length) {
        stopTypingAnimation();
        setIsParagraphComplete(true);
        if (paragraphIndex === dialogue.length - 1) {
          onTypingComplete();
        }
      }
    }, GAMEPLAY.TYPING_SPEED_MS);

    typingIntervalRef.current = intervalId;

    return () => stopTypingAnimation();
  }, [dialogue, paragraphIndex, onTypingComplete, stopTypingAnimation, isLoading]);


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
        <p className={`font-serif text-gray-200 leading-relaxed font-medium text-outline ${fontSizeClass}`}>
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