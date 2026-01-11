// React Query Hook封装
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import { IpcSearchService } from '../services/IpcSearchService';
import { IpcDownloadService } from '../services/IpcDownloadService';
import { DownloadType } from '../types';
import { UnifiedDownloadRequest } from '../types/unified-interface';

const searchService = new IpcSearchService();
const downloadService = new IpcDownloadService();

// 搜索查询Hook
export function useSearchQuery(
  query: string,
  type: DownloadType,
  platform: string,
  page: number,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.search(query, type, platform, page),
    queryFn: () => searchService.search({
      query: query,
      fileType: type as any,
      platform: platform,
      page: page,
      pageSize: 20
    }),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2分钟
    ...options,
  });
}

// 平台列表查询Hook
export function usePlatformsQuery(type?: DownloadType) {
  return useQuery({
    queryKey: queryKeys.platforms(type),
    queryFn: () => searchService.getAllPlatforms(),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

// 任务列表查询Hook
export function useTasksQuery(type?: DownloadType) {
  return useQuery({
    queryKey: queryKeys.tasks(type),
    queryFn: () => downloadService.getAllTasks(),
    select: (tasks: any[]) => type ? tasks.filter((task: any) => task.type === type) : tasks,
    refetchInterval: 5000, // 5秒轮询
  });
}

// 开始下载Mutation Hook
export function useStartDownloadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { url: string; filename: string; type: DownloadType; platform: string }) => {
      const request: UnifiedDownloadRequest = {
        url: params.url,
        filename: params.filename,
        fileType: params.type as any,
        platform: params.platform
      };
      return downloadService.download(request).then(res => res.taskId);
    },
    
    onSuccess: (taskId) => {
      // 使任务列表查询无效，触发重新获取
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      
      // 可以在这里添加成功通知
      console.log('下载任务已开始:', taskId);
    },
    
    onError: (error) => {
      console.error('开始下载失败:', error);
      // 可以在这里添加错误通知
    },
  });
}

// 搜索建议查询Hook
export function useSearchSuggestionsQuery(query: string, type: DownloadType) {
  return useQuery({
    queryKey: queryKeys.searchSuggestions(query, type),
    queryFn: () => searchService.getSearchSuggestions(query, type),
    enabled: query.length > 1, // 至少2个字符才触发
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 搜索Mutation Hook
export function useSearchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { query: string; fileType: DownloadType; platform: string; page: number; pageSize: number }) => {
      return searchService.search({
        query: params.query,
        fileType: params.fileType as any,
        platform: params.platform,
        page: params.page,
        pageSize: params.pageSize
      });
    },
    
    onSuccess: (results) => {
      // 使搜索查询无效，触发重新获取
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.search('', '', '', 0) 
      });
      
      // 可以在这里添加成功通知
      console.log('搜索成功，找到结果:', results.items.length);
    },
    
    onError: (error) => {
      console.error('搜索失败:', error);
      // 可以在这里添加错误通知
    },
  });
}