import React from 'react';
import { QuickCommandButton } from './QuickCommandButton';

interface CommandInputProps {
  command: string;
  isRunning: boolean;
  onCommandChange: (command: string) => void;
  onExecute: () => void;
  onCopyCommand: () => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  command,
  isRunning,
  onCommandChange,
  onExecute,
  onCopyCommand
}) => {
  const quickCommands = [
    { label: '🎵 Music', cmd: 'yt-dlp --extract-audio --audio-format mp3 --audio-quality 0' },
    { label: '🎬 Video', cmd: 'yt-dlp ' },
    { label: '🖼️ Images', cmd: 'yt-dlp --write-thumbnail --skip-download --convert-thumbnails jpg' },
    { label: '📺 HD Quality', cmd: 'yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --merge-output-format mp4' },
    { label: '📱 Mobile', cmd: 'yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" --merge-output-format mp4' },
    { label: '📄 Subtitles', cmd: 'yt-dlp --write-sub --sub-langs zh,en --convert-subs srt' },
    { label: '🔍 Info', cmd: 'yt-dlp --list-formats' }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <textarea
            value={command}
            onChange={(e) => onCommandChange(e.target.value)}
            placeholder="Enter download command, e.g.: yt-dlp https://www.bilibili.com/video/BV1HZrpBTEDe/?spm_id_from=333.1007.tianma.1-1-1.click"
            className="w-full h-16 lg:h-20 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-xs sm:text-sm font-mono resize-y"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onExecute();
              }
            }}
            disabled={isRunning}
          />
          {command && (
            <button
              onClick={onCopyCommand}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 transition-colors"
              title="Copy command"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onExecute}
          disabled={isRunning || !command.trim()}
          className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
        >
          {isRunning ? (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Executing
            </>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execute
            </>
          )}
        </button>
      </div>
      
      {/* Quick Commands */}
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-2">Quick Commands:</div>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
          {quickCommands.map((item, index) => (
            <QuickCommandButton
              key={index}
              label={item.label}
              cmd={item.cmd}
              onClick={onCommandChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};