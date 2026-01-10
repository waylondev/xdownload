import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text,
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="ml-2 text-sm text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );
};

// 页面级加载组件
export const PageLoading: React.FC<{ message?: string }> = ({ message = '加载中...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
    <Loading size="lg" />
    <p className="mt-4 text-muted-foreground">{message}</p>
  </div>
);

// 内联加载组件
export const InlineLoading: React.FC<LoadingProps> = (props) => (
  <Loading {...props} className={cn('inline-flex', props.className)} />
);