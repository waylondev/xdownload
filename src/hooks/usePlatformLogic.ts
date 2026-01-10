// 平台逻辑Hook
import { useCallback } from 'react';
import { DownloadType } from '../types';
import { useDownloadActions, useSearchActions } from '../stores/appStore';
import { IpcSearchService } from '../services/IpcSearchService';

const searchService = new IpcSearchService();

export function usePlatformLogic() {
  const downloadActions = useDownloadActions();
  const searchActions = useSearchActions();

  // 平台切换处理
  const handlePlatformChange = useCallback((platform: string) => {
    downloadActions.setSelectedPlatform(platform);
    searchActions.clearSearch();
  }, [downloadActions.setSelectedPlatform, searchActions.clearSearch]);

  // 下载类型切换处理
  const handleTypeChange = useCallback((type: DownloadType, loadTasks: () => Promise<void>) => {
    downloadActions.setActiveType(type);
    loadTasks();
  }, [downloadActions.setActiveType]);

  // 获取可用平台
  const getAvailablePlatforms = useCallback(async () => {
    try {
      // 直接返回所有平台，暂时不支持按类型过滤
      return await searchService.getAllPlatforms();
    } catch (error) {
      console.error('获取平台列表失败:', error);
      return [];
    }
  }, [searchService]);

  // 检查平台可用性
  const checkPlatformAvailability = useCallback(async (platformId: string) => {
    try {
      const platform = await searchService.getPlatformInfo(platformId);
      return platform !== null && platform.isEnabled !== false;
    } catch (error) {
      console.error('检查平台可用性失败:', error);
      return false;
    }
  }, [searchService]);

  return {
    handlePlatformChange,
    handleTypeChange,
    getAvailablePlatforms,
    checkPlatformAvailability
  };
}