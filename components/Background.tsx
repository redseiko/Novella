
import React, { useState, useEffect } from 'react';

interface BackgroundColor {
    from: string;
    to: string;
}

interface DebugInfo {
    type: 'image' | 'gradient' | 'default';
}

interface BackgroundProps {
  backgroundKey: string;
  backgroundsMap: Record<string, BackgroundColor>;
  activeStoryId: string;
  onUpdate: (info: DebugInfo) => void;
}

const Background: React.FC<BackgroundProps> = ({ backgroundKey, backgroundsMap, activeStoryId, onUpdate }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const colors = backgroundsMap[backgroundKey] || backgroundsMap['default'];
  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at center, ${colors.from} 0%, ${colors.to} 80%)`,
  };

  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const loadImage = async () => {
        setImageLoaded(false);
        // Clear previous image URL immediately
        setImageUrl(''); 

        // Determine initial background type and update debug panel
        if (backgroundsMap[backgroundKey]) {
            onUpdate({ type: 'gradient' });
        } else {
            onUpdate({ type: 'default' });
        }

        // List of image formats to try, in order of preference for web performance.
        const extensions = ['webp', 'jpg', 'png'];
        
        for (const ext of extensions) {
            // If the component has unmounted, stop trying to fetch images.
            if (controller.signal.aborted) return;

            const imageUrlPath = `./stories/${activeStoryId}/background/${backgroundKey}.${ext}`;
            try {
                const response = await fetch(imageUrlPath, { signal: controller.signal });
                if (response.ok) {
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    
                    // Only update state if the component is still mounted.
                    if (!controller.signal.aborted) {
                        setImageUrl(objectUrl);
                        setImageLoaded(true);
                        onUpdate({ type: 'image' });
                    }
                    // Successfully found and loaded an image, so we stop the loop.
                    return; 
                }
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    // If fetch was explicitly aborted, break out of the loop.
                    break; 
                }
                // For other errors (like a 404 which `!response.ok` handles), 
                // we simply continue to the next extension.
            }
        }
    };

    loadImage();

    // Cleanup function
    return () => {
        controller.abort(); // Abort fetch if component unmounts or deps change
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl); // Cleanup the object URL to prevent memory leaks
        }
    };
  }, [backgroundKey, activeStoryId, backgroundsMap, onUpdate]);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Procedural Gradient Background Layer - always present underneath */}
      <div
        className="absolute inset-0 animate-pulse-bg"
        style={gradientStyle}
      />
      {/* Image Background Layer - fades in/out on top of the gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            opacity: imageLoaded ? 1 : 0,
        }}
      />
    </div>
  );
};

export default Background;