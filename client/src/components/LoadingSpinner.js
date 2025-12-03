import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-slate-700`}></div>
        
        {/* Animated ring */}
        <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin`}></div>
        
        {/* Inner pulse */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse`}></div>
      </div>
      
      {text && (
        <p className="text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
