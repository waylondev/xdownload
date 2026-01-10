// 搜索功能Hook
import { useCallback } from 'react';
import { DownloadType } from '../types';
import { IpcSearchService } from '../services/IpcSearchService';
import { UnifiedSearchRequest } from '../types/unified-interface';

export interface SearchOptions {
  page: number;
  pageSize: number;
  platform: string;
}

const searchService = new IpcSearchService();

export const useSearch = () => {
  // 执行搜索
  const search = useCallback(async (
    query: string, 
    type: DownloadType, 
    options: SearchOptions
  ) => {
    if (!query.trim()) {
      throw new Error('搜索查询不能为空');
    }

    try {
      const request: UnifiedSearchRequest = {
        query,
        fileType: type as any,
        platform: options.platform,
        page: options.page,
        pageSize: options.pageSize
      };
      const result = await searchService.search(request);
      return result;
    } catch (error) {
      console.error('搜索失败:', error);
      throw new Error(`搜索失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, []);

  // 验证搜索参数
  const validateSearchParams = useCallback((query: string, type: DownloadType) => {
    const errors: string[] = [];

    if (!query.trim()) {
      errors.push('搜索查询不能为空');
    }

    if (query.length < 2) {
      errors.push('搜索查询至少需要2个字符');
    }

    if (query.length > 100) {
      errors.push('搜索查询不能超过100个字符');
    }

    if (!['music', 'video', 'file'].includes(type)) {
      errors.push('无效的下载类型');
    }

    return errors;
  }, []);

  return {
    search,
    validateSearchParams
  };
};