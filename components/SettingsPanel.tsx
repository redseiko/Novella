import React, { useState } from 'react';

interface SettingsPanelProps {
    onIncreaseFont: () => void;
    onDecreaseFont: () => void;
    onRestartStory: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    onIncreaseFont, 
    onDecreaseFont,
    onRestartStory,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleRestart = () => {
        onRestartStory();
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
            <div className="relative z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Toggle settings"
                    aria-expanded={isOpen}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="absolute top-14 right-0 w-64 bg-black/80 backdrop-blur-md rounded-lg border border-gray-700 shadow-lg animate-fade-in">
                        <div className="p-4 space-y-4">
                            <h3 className="text-lg font-semibold text-white text-center border-b border-gray-600 pb-2">Settings</h3>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-white font-sans text-base">Font Size</span>
                                <div className="flex items-center space-x-2">
                                    <button onClick={onDecreaseFont} className="w-10 h-10 bg-gray-700 rounded text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold">-</button>
                                    <button onClick={onIncreaseFont} className="w-10 h-10 bg-gray-700 rounded text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold">+</button>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-base font-semibold text-white text-center border-b border-gray-600 pb-2 mb-2">Story Options</h4>
                                <div className="flex flex-col space-y-2">
                                    <button onClick={handleRestart} className="w-full px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600 transition-colors font-sans">Restart Story</button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SettingsPanel;