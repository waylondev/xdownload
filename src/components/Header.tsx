import React from 'react';

interface HeaderProps {
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isRunning }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">XDownload</h1>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center gap-4">
        {isRunning && (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Executing</span>
          </div>
        )}
      </div>
    </div>
  );
};