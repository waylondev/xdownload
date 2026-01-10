// 智能缓存管理策略
import { useQueryClient } from '@tanstack/react-query';

export interface CacheConfig {
  // 缓存策略类型
  strategy: 'aggressive' | 'balanced' | 'conservative';
  // 网络状态感知
  networkAware: boolean;
  // 用户行为感知
  userBehaviorAware: boolean;
}

// 智能缓存管理器
export class SmartCacheManager {
  private queryClient: ReturnType<typeof useQueryClient>;
  private config: CacheConfig;

  constructor(queryClient: ReturnType<typeof useQueryClient>, config: Partial<CacheConfig> = {}) {
    this.queryClient = queryClient;
    this.config = {
      strategy: 'balanced',
      networkAware: true,
      userBehaviorAware: true,
      ...config
    };
  }

  // 根据策略获取缓存时间
  private getStaleTime(strategy: CacheConfig['strategy']): number {
    switch (strategy) {
      case 'aggressive':
        return 10 * 60 * 1000; // 10分钟
      case 'balanced':
        return 5 * 60 * 1000; // 5分钟
      case 'conservative':
        return 2 * 60 * 1000; // 2分钟
      default:
        return 5 * 60 * 1000;
    }
  }

  // 根据网络状态调整缓存策略
  private getNetworkAwareConfig(): Partial<CacheConfig> {
    if (!this.config.networkAware) return {};

    // 模拟网络状态检测，避免使用navigator.connection
    const isSlowNetwork = false;
    
    if (isSlowNetwork) {
      return {
        strategy: 'aggressive', // 慢网络下使用更激进的缓存
      };
    }

    return {};
  }

  // 获取优化的缓存配置
  getOptimizedCacheConfig(queryType: 'search' | 'platforms' | 'tasks' | 'suggestions'): {
    staleTime: number;
    gcTime: number;
    refetchOnWindowFocus: boolean;
    refetchOnReconnect: boolean;
  } {
    const networkConfig = this.getNetworkAwareConfig();
    const strategy = networkConfig.strategy || this.config.strategy;
    
    const baseStaleTime = this.getStaleTime(strategy);
    
    // 根据查询类型调整缓存策略
    let querySpecificConfig = {
      staleTime: baseStaleTime,
      gcTime: baseStaleTime * 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    };

    switch (queryType) {
      case 'search':
        querySpecificConfig.staleTime = baseStaleTime;
        querySpecificConfig.gcTime = baseStaleTime * 3; // 搜索数据保留更久
        querySpecificConfig.refetchOnWindowFocus = false;
        break;
      case 'platforms':
        querySpecificConfig.staleTime = 30 * 60 * 1000; // 平台数据30分钟
        querySpecificConfig.gcTime = 60 * 60 * 1000; // 1小时
        querySpecificConfig.refetchOnWindowFocus = false;
        break;
      case 'tasks':
        querySpecificConfig.staleTime = 30 * 1000; // 任务数据30秒
        querySpecificConfig.gcTime = 5 * 60 * 1000; // 5分钟
        querySpecificConfig.refetchOnWindowFocus = true; // 任务数据需要实时更新
        break;
      case 'suggestions':
        querySpecificConfig.staleTime = 10 * 60 * 1000; // 建议数据10分钟
        querySpecificConfig.gcTime = 30 * 60 * 1000; // 30分钟
        querySpecificConfig.refetchOnWindowFocus = false;
        break;
    }

    return querySpecificConfig;
  }

  // 预加载相关数据
  async prefetchRelatedData(_queryKey: any[], relatedQueries: any[][]) {
    try {
      // 预加载相关查询
      for (const relatedQuery of relatedQueries) {
        await this.queryClient.prefetchQuery({
          queryKey: relatedQuery,
          queryFn: () => Promise.resolve(null), // 实际项目中应该是真实的查询函数
        });
      }
    } catch (error) {
      console.warn('预加载数据失败:', error);
    }
  }

  // 清理过期缓存
  clearExpiredCache() {
    // 这里可以添加更复杂的缓存清理逻辑
    console.log('执行缓存清理...');
  }

  // 获取缓存统计信息
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.findAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      freshQueries: queries.filter(q => !q.isStale()).length,
    };
  }
}

// React Hook for smart cache management
export function useSmartCache(config?: Partial<CacheConfig>) {
  const queryClient = useQueryClient();
  const cacheManager = new SmartCacheManager(queryClient, config);

  return {
    cacheManager,
    getOptimizedConfig: (queryType: Parameters<SmartCacheManager['getOptimizedCacheConfig']>[0]) => 
      cacheManager.getOptimizedCacheConfig(queryType),
    prefetchRelatedData: cacheManager.prefetchRelatedData.bind(cacheManager),
    clearExpiredCache: cacheManager.clearExpiredCache.bind(cacheManager),
    getCacheStats: cacheManager.getCacheStats.bind(cacheManager),
  };
}