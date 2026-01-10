// 用户友好的错误显示组件
import React from 'react';
import { ErrorReport } from '../../services/ErrorHandlingService';

interface ErrorDisplayProps {
  error?: Error | string;
  errorReport?: ErrorReport;
  title?: string;
  message?: string;
  severity?: 'low' | 'medium' | 'high';
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

// 错误图标组件
const ErrorIcon = ({ severity }: { severity: string }) => {
  const iconMap = {
    high: (
      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    medium: (
      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    low: (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return iconMap[severity as keyof typeof iconMap] || iconMap.medium;
};

// 错误显示组件
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorReport,
  title,
  message,
  severity = 'medium',
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  // 从错误对象或错误报告中提取信息
  const errorMessage = message || 
    (typeof error === 'string' ? error : error?.message) || 
    errorReport?.message || 
    '发生未知错误';
    
  const errorTitle = title || 
    (severity === 'high' ? '严重错误' : 
     severity === 'medium' ? '警告' : '提示');

  // 错误类型映射
  const getFriendlyMessage = (msg: string) => {
    const messageMap: Record<string, string> = {
      'Network Error': '网络连接失败，请检查网络设置',
      'Failed to fetch': '请求失败，请检查网络连接',
      'Timeout': '请求超时，请稍后重试',
      'Invalid URL': '无效的URL地址',
      'Search failed': '搜索失败，请检查搜索条件',
      'Download failed': '下载失败，请检查网络连接',
      'Platform unavailable': '平台暂时不可用，请稍后重试'
    };
    
    return messageMap[msg] || msg;
  };

  const friendlyMessage = getFriendlyMessage(errorMessage);

  // 样式配置
  const severityStyles = {
    high: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700'
    },
    medium: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    low: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = severityStyles[severity];

  return (
    <div className={`rounded-lg border p-4 ${styles.bg} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ErrorIcon severity={severity} />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.text}`}>
            {errorTitle}
          </h3>
          
          <div className={`mt-1 text-sm ${styles.text}`}>
            <p>{friendlyMessage}</p>
            
            {showDetails && errorReport && (
              <div className="mt-2 text-xs opacity-75">
                <p>时间: {new Date(errorReport.timestamp).toLocaleString()}</p>
                {errorReport.category && <p>类型: {errorReport.category}</p>}
                {errorReport.url && <p>页面: {errorReport.url}</p>}
              </div>
            )}
            
            {showDetails && typeof error !== 'string' && error?.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">技术详情</summary>
                <pre className="mt-1 text-xs bg-black bg-opacity-10 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  type="button"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={onRetry}
                >
                  重试
                </button>
              )}
              
              {onDismiss && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onDismiss}
                >
                  忽略
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 错误边界显示组件
export const ErrorBoundaryDisplay: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <ErrorDisplay
          error={error}
          severity="high"
          title="应用遇到问题"
          message="抱歉，应用遇到了一个意外错误。这可能是暂时的，请尝试重新加载页面。"
          onRetry={resetErrorBoundary}
          showDetails={import.meta.env.DEV}
        />
        
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            重新加载页面
          </button>
        </div>
      </div>
    </div>
  );
};

// 加载状态组件
export const LoadingState: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message = '加载中...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  );
};

// 空状态组件
export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ 
  title = '暂无数据', 
  message = '当前没有找到任何内容',
  icon,
  action 
}) => {
  return (
    <div className="text-center py-12">
      {icon || (
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};