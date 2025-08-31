
import { useState } from 'react';
import { UI } from '../config';

const MAX_FONT_SIZE_INDEX = UI.FONT_SIZES.dialog.length - 1;

export const useUISettings = () => {
  const [fontSizeIndex, setFontSizeIndex] = useState(0);

  const increaseFontSize = () => setFontSizeIndex(prev => Math.min(prev + 1, MAX_FONT_SIZE_INDEX));
  const decreaseFontSize = () => setFontSizeIndex(prev => Math.max(prev - 1, 0));

  return {
    fontSizeIndex,
    increaseFontSize,
    decreaseFontSize,
  };
};
