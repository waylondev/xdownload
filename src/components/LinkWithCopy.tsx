import React from 'react';

interface LinkWithCopyProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export const LinkWithCopy: React.FC<LinkWithCopyProps> = ({ href, icon, label }) => {
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-2">
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
      >
        {icon}
        {label}
      </a>
      <button 
        onClick={() => copyLink(href)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        title="复制链接"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
};