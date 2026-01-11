import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IpcSearchService } from '../services/IpcSearchService';
import { IpcDownloadService } from '../services/IpcDownloadService';

const searchService = new IpcSearchService();
const downloadService = new IpcDownloadService();

// 类型映射：前端类型 -> 后端类型
const mapFileType = (type: 'music' | 'video' | 'file'): 'audio' | 'video' | 'document' => {
  switch (type) {
    case 'music': return 'audio';
    case 'video': return 'video';
    case 'file': return 'document';
    default: return 'document';
  }
};

// 搜索
interface SearchParams {
  query: string;
  fileType: 'music' | 'video' | 'file';
  platform: string;
  page: number;
  pageSize: number;
}

export const useSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: SearchParams) => searchService.search({
      query: params.query,
      fileType: mapFileType(params.fileType),
      platform: params.platform,
      page: params.page,
      pageSize: params.pageSize
    }),
    onSuccess: (data) => {
      // 将搜索结果保存到React Query缓存中
      queryClient.setQueryData(['search'], data);
      // 通知React Query刷新依赖于该缓存的组件
      queryClient.invalidateQueries({ queryKey: ['search'] });
    }
  });
};

// 获取平台列表
export const usePlatforms = (fileType?: 'music' | 'video' | 'file') => {
  return useQuery({
    queryKey: ['platforms', fileType],
    queryFn: async () => {
      const allPlatforms = await searchService.getAllPlatforms();
      if (!fileType) {
        return allPlatforms;
      }
      
      // 根据文件类型过滤平台
      const mapFileTypeToBackend = (type: 'music' | 'video' | 'file') => {
        switch (type) {
          case 'music': return 'audio';
          case 'video': return 'video';
          case 'file': return 'document';
        }
      };
      
      const backendType = mapFileTypeToBackend(fileType);
      return allPlatforms.filter(platform => {
        return platform.supportedFileTypes.includes(backendType);
      });
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

// 获取任务列表
export const useTasks = (type?: 'music' | 'video' | 'file') => {
  return useQuery({
    queryKey: ['tasks', type],
    queryFn: () => downloadService.getAllDownloads(),
    select: (tasks) => type ? tasks.filter((task: any) => task.fileType === mapFileType(type)) : tasks,
    refetchInterval: 5000, // 5秒轮询
  });
};

// 开始下载
export const useDownload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { url: string; filename: string; type: 'music' | 'video' | 'file'; platform: string }) => {
      return downloadService.download({
        url: params.url,
        filename: params.filename,
        fileType: mapFileType(params.type),
        platform: params.platform
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};