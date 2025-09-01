
import React from 'react';

interface TitleScreenProps {
  title: string;
  chapter?: string;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ title, chapter }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in text-white w-full">
      <h1 
        className="font-serif text-6xl md:text-7xl font-bold tracking-wider text-outline"
      >
        {title}
      </h1>
      {chapter && (
        <h2 className="font-sans text-2xl md:text-3xl text-indigo-300 mt-4 tracking-widest uppercase font-semibold text-outline">
            {chapter}
        </h2>
      )}
    </div>
  );
};

export default TitleScreen;
