import React from 'react';

interface DownloadLogProps {
  output: string[];
  onClearOutput: () => void;
}

export const DownloadLog: React.FC<DownloadLogProps> = ({ output, onClearOutput }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Download Log</span>
        <button
          onClick={onClearOutput}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
      <div className="h-96 overflow-y-auto p-4 font-mono text-sm">
        {output.length === 0 ? (
          <div className="text-gray-500 italic">
            Waiting for download task to start...
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="mb-1">
              {line.startsWith('Error:') ? (
                <span className="text-red-400">{line}</span>
              ) : line.startsWith('$') ? (
                <span className="text-blue-400">{line}</span>
              ) : line.includes('Download completed') || line.includes('successfully') ? (
                <span className="text-green-400">{line}</span>
              ) : (
                <span className="text-gray-300">{line}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};