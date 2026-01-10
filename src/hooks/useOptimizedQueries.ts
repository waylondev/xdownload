// 优化的React Query钩子 - 使用智能缓存策略
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import { SearchResult, PaginationResult, DownloadType } from '../types';
import { useSmartCache } from './useSmartCache';

// 搜索查询钩子 - 智能缓存策略
export function useSearchQuery(
  query: string,
  type: DownloadType,
  platform: string,
  page: number,
  enabled: boolean = true,
  options: Partial<UseQueryOptions<PaginationResult<SearchResult>>> = {}
) {
  const { getOptimizedConfig } = useSmartCache();
  const cacheConfig = getOptimizedConfig('search');

  return useQuery({
    queryKey: queryKeys.search(query, type, platform, page),
    queryFn: async () => {
      if (!query.trim()) {
        return { items: [], total: 0, page, pageSize: 10, totalPages: 0 };
      }
      
      // 这里应该调用搜索服务
      // 目前返回模拟数据
      return {
        items: [
          {
            id: '1',
            title: `搜索结果: ${query}`,
            description: `这是关于 ${query} 的搜索结果`,
            url: 'https://example.com',
            thumbnail: '',
            duration: '3:45',
            size: '5.2MB',
            platform: platform,
            type: type
          }
        ],
        total: 1,
        page,
        pageSize: 10,
        totalPages: 1
      };
    },
    enabled: enabled && !!query.trim(),
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
    ...options
  });
}

// 搜索建议查询钩子
export function useSearchSuggestions(
  query: string,
  type: DownloadType,
  enabled: boolean = true
) {
  const { getOptimizedConfig } = useSmartCache();
  const cacheConfig = getOptimizedConfig('suggestions');

  return useQuery({
    queryKey: queryKeys.searchSuggestions(query, type),
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // 模拟搜索建议
      return [
        `${query} 热门搜索`,
        `${query} 最新资源`,
        `${query} 高清版本`,
        `${query} 无损音质`,
        `${query} 官方原版`
      ];
    },
    enabled: enabled && query.trim().length > 1,
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    retry: 2,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
  });
}

// 热门搜索查询钩子
export function usePopularSearches(type: DownloadType) {
  const { getOptimizedConfig } = useSmartCache();
  const cacheConfig = getOptimizedConfig('suggestions');

  return useQuery({
    queryKey: queryKeys.popularSearches(type),
    queryFn: async () => {
      // 模拟热门搜索
      return [
        '周杰伦 - 七里香',
        'Taylor Swift - Blank Space',
        '热门电影推荐',
        '最新电视剧',
        '学习资料下载'
      ];
    },
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnMount: false, // 组件挂载时不重新获取
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
  });
}

// 平台查询钩子
export function usePlatformsQuery(type?: DownloadType) {
  const { getOptimizedConfig } = useSmartCache();
  const cacheConfig = getOptimizedConfig('platforms');

  return useQuery({
    queryKey: queryKeys.platforms(type),
    queryFn: async () => {
      // 这里应该调用IPC获取平台数据
      // 目前返回模拟数据
      return [
        {
          id: 'netease',
          name: '网易云音乐',
          type: 'music' as DownloadType,
          icon: '🎵',
          description: '高品质音乐平台',
          enabled: true
        },
        {
          id: 'qq',
          name: 'QQ音乐',
          type: 'music' as DownloadType,
          icon: '🎶',
          description: '海量音乐资源',
          enabled: true
        }
      ];
    },
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
  });
}

// 任务查询钩子
export function useTasksQuery(type?: DownloadType) {
  const { getOptimizedConfig } = useSmartCache();
  const cacheConfig = getOptimizedConfig('tasks');

  return useQuery({
    queryKey: queryKeys.tasks(type),
    queryFn: async () => {
      // 这里应该调用IPC获取任务数据
      // 目前返回模拟数据
      return [
        {
          id: '1',
          title: '示例任务',
          status: 'completed',
          progress: 100,
          type: type || 'music'
        }
      ];
    },
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
    refetchInterval: 5000, // 任务数据每5秒自动刷新
  });
}

// 平台列表查询钩子
export function usePlatforms(type?: DownloadType) {
  return useQuery({
    queryKey: queryKeys.platforms(type),
    queryFn: async () => {
      // 这里应该调用平台配置服务
      const { getAllPlatforms } = await import('../lib/config');
      const platforms = await getAllPlatforms();
      
      if (type) {
        return platforms.filter(p => p.type === type);
      }
      
      return platforms;
    },
    staleTime: 15 * 60 * 1000, // 15分钟缓存
    gcTime: 2 * 60 * 60 * 1000, // 2小时垃圾回收
  });
}

// 搜索历史管理钩子
export function useSearchHistory() {
  const queryClient = useQueryClient();
  
  const { data: searchHistory = [] } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => {
      const history = localStorage.getItem('search-history');
      return history ? JSON.parse(history) : [];
    },
    staleTime: Infinity, // 永久缓存，手动更新
  });
  
  const addToSearchHistory = useMutation({
    mutationFn: async (searchItem: { query: string; type: DownloadType; timestamp: number }) => {
      const history = searchHistory.filter((item: any) => 
        item.query !== searchItem.query || item.type !== searchItem.type
      );
      
      const newHistory = [searchItem, ...history].slice(0, 20); // 保留最近20条
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(['search-history'], newHistory);
    }
  });
  
  return {
    searchHistory,
    addToSearchHistory: addToSearchHistory.mutateAsync
  };
}

// 批量查询优化钩子
export function useBatchQueries<T>(
  queries: Array<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<T>;
    enabled?: boolean;
  }>
) {
  const results = queries.map(({ queryKey, queryFn, enabled = true }) => 
    useQuery({
      queryKey,
      queryFn,
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    })
  );
  
  return {
    results,
    isPending: results.some(result => result.isPending),
    isError: results.some(result => result.isError),
    isSuccess: results.every(result => result.isSuccess),
  };
}