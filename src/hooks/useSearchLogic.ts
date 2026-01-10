// 搜索逻辑Hook
import { useCallback } from 'react';
import { DownloadType } from '../types';
import { useSearchActions, useUIActions } from '../stores/appStore';
import { IpcSearchService } from '../services/IpcSearchService';

const searchService = new IpcSearchService();

export function useSearchLogic() {
  const searchActions = useSearchActions();
  const uiActions = useUIActions();

  // 搜索处理
  const handleSearch = useCallback(async (
    query: string, 
    type: DownloadType
  ) => {
    if (!query.trim()) {
      uiActions.setError('搜索查询不能为空');
      return;
    }

    try {
      uiActions.setLoading(true);
      uiActions.setError(null);

      const result = await searchService.search({
        query: query,
        fileType: type as any,
        platform: 'all',
        page: 1,
        pageSize: 20
      });
      // 将SearchItem转换为SearchResult，添加type字段
      const searchResults = result.items.map((item: any) => ({
        ...item,
        type: type
      }));
      searchActions.setSearchResults(searchResults);
      searchActions.setTotalPages(result.totalPages);
      uiActions.setLoading(false);

    } catch (error) {
      console.error('搜索失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '搜索失败');
      searchActions.setSearchResults([]);
      uiActions.setLoading(false);
    }
  }, [searchActions.setSearchResults, searchActions.setTotalPages, uiActions.setLoading, uiActions.setError]);

  // 获取搜索建议
  const getSearchSuggestions = useCallback(async (
    query: string, 
    platform: string
  ) => {
    if (!query.trim()) {
      return [];
    }

    try {
      return await searchService.getSearchSuggestions(query, platform);
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      return [];
    }
  }, []);

  // 页面变化处理
  const handlePageChange = useCallback(async (
    page: number, 
    query: string, 
    type: DownloadType
  ) => {
    searchActions.setCurrentPage(page);
    
    if (query.trim()) {
      await handleSearch(query, type);
    }
  }, [searchActions.setCurrentPage, handleSearch]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    searchActions.clearSearch();
  }, [searchActions.clearSearch]);

  return {
    handleSearch,
    getSearchSuggestions,
    handlePageChange,
    clearSearch
  };
}