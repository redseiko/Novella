
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-400"></div>
        <p className="text-gray-400">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
