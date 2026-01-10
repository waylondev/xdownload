// React Query配置和工具 - 充分利用高级功能
import { QueryClient, onlineManager, focusManager } from '@tanstack/react-query';
import { DEFAULT_VALUES } from '../config/constants';

// 网络状态管理
onlineManager.setEventListener((setOnline) => {
  const handleOnline = () => setOnline(true);
  const handleOffline = () => setOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
});

// 窗口焦点管理
focusManager.setEventListener((handleFocus) => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      handleFocus();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
});

// 全局查询客户端配置
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_VALUES.STALE_TIME,
      gcTime: DEFAULT_VALUES.GC_TIME,
      retry: (failureCount, error: any) => {
        // 网络错误重试，其他错误不重试
        if (error?.message?.includes('网络') || error?.code === 'NETWORK_ERROR') {
          return failureCount < 2;
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // 全局错误处理
        console.error('Mutation error:', error);
      },
    },
  },
});

// 查询键工厂
export const queryKeys = {
  search: (query: string, type: string, platform: string, page: number) => 
    ['search', query, type, platform, page],
  
  platforms: (type?: string) => ['platforms', type],
  
  tasks: (type?: string) => ['tasks', type],
  
  task: (id: string) => ['task', id],
  
  popularSearches: (type: string) => ['popular-searches', type],
  
  searchSuggestions: (query: string, type: string) => ['search-suggestions', query, type],
} as const;

// 通用的查询函数类型
export type QueryKey = readonly unknown[];