import React from 'react';

interface QuickCommandButtonProps {
  label: string;
  cmd: string;
  onClick: (cmd: string) => void;
}

export const QuickCommandButton: React.FC<QuickCommandButtonProps> = ({ label, cmd, onClick }) => {
  return (
    <button
      onClick={() => onClick(cmd + ' ')}
      className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-xs transition-colors border border-gray-600"
    >
      {label}
    </button>
  );
};