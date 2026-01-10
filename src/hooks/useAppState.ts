// 应用状态管理Hook
import { useState, useCallback } from 'react';
import { DownloadType, SearchResult, DownloadTask } from '../types';

export interface AppState {
  activeType: DownloadType;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResults: string[];
  tasks: DownloadTask[];
  currentPage: number;
  totalPages: number;
  selectedPlatform: string;
  loading: boolean;
  error: string | null;
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    activeType: 'music',
    searchQuery: '',
    searchResults: [],
    selectedResults: [],
    tasks: [],
    currentPage: 1,
    totalPages: 1,
    selectedPlatform: 'all',
    loading: false,
    error: null,
  });

  // 更新状态的方法
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 设置加载状态
  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading });
  }, [updateState]);

  // 设置错误
  const setError = useCallback((error: string | null) => {
    updateState({ error });
  }, [updateState]);

  // 切换下载类型
  const setActiveType = useCallback((activeType: DownloadType) => {
    updateState({ 
      activeType, 
      selectedPlatform: 'all',
      searchResults: [],
      selectedResults: [],
      currentPage: 1,
      error: null 
    });
  }, [updateState]);

  // 设置搜索查询
  const setSearchQuery = useCallback((searchQuery: string) => {
    updateState({ searchQuery });
  }, [updateState]);

  // 设置搜索结果
  const setSearchResults = useCallback((searchResults: SearchResult[]) => {
    updateState({ searchResults, selectedResults: [] });
  }, [updateState]);

  // 切换选择结果
  const toggleResultSelection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedResults: prev.selectedResults.includes(id)
        ? prev.selectedResults.filter(resultId => resultId !== id)
        : [...prev.selectedResults, id]
    }));
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedResults: prev.selectedResults.length === prev.searchResults.length
        ? []
        : prev.searchResults.map(result => result.id)
    }));
  }, []);

  // 设置任务列表
  const setTasks = useCallback((tasks: DownloadTask[]) => {
    updateState({ tasks });
  }, [updateState]);

  // 设置当前页面
  const setCurrentPage = useCallback((currentPage: number) => {
    updateState({ currentPage });
  }, [updateState]);

  // 设置总页数
  const setTotalPages = useCallback((totalPages: number) => {
    updateState({ totalPages });
  }, [updateState]);

  // 设置选择的平台
  const setSelectedPlatform = useCallback((selectedPlatform: string) => {
    updateState({ 
      selectedPlatform,
      searchResults: [],
      selectedResults: [],
      currentPage: 1,
      error: null 
    });
  }, [updateState]);

  // 清除搜索状态
  const clearSearch = useCallback(() => {
    updateState({
      searchResults: [],
      selectedResults: [],
      searchQuery: '',
      currentPage: 1,
      error: null
    });
  }, [updateState]);

  return {
    state,
    actions: {
      updateState,
      setLoading,
      setError,
      setActiveType,
      setSearchQuery,
      setSearchResults,
      toggleResultSelection,
      toggleSelectAll,
      setTasks,
      setCurrentPage,
      setTotalPages,
      setSelectedPlatform,
      clearSearch,
    }
  };
};