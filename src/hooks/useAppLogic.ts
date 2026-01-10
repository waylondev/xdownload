// 重构后的应用逻辑Hook - 组合模式
import { useSearchLogic } from './useSearchLogic';
import { useDownloadLogic } from './useDownloadLogic';
import { usePlatformLogic } from './usePlatformLogic';
import { DownloadType } from '../types';
export function useAppLogic() {
  // 使用专门的Hook
  const searchLogic = useSearchLogic();
  const downloadLogic = useDownloadLogic();
  const platformLogic = usePlatformLogic();
  
  // 组合各个逻辑
  const handleTypeChange = (type: DownloadType) => {
    platformLogic.handleTypeChange(type, () => downloadLogic.loadTasks(type));
  };

  const handleBatchDownload = async (
    selectedResults: string[], 
    searchResults: any[], 
    type: DownloadType
  ) => {
    await downloadLogic.handleBatchDownload(selectedResults, searchResults, type);
    searchLogic.clearSearch();
  };

  return {
    // 搜索逻辑
    handleSearch: searchLogic.handleSearch,
    getSearchSuggestions: searchLogic.getSearchSuggestions,
    handlePageChange: searchLogic.handlePageChange,
    clearSearch: searchLogic.clearSearch,

    // 下载逻辑
    loadTasks: downloadLogic.loadTasks,
    handleDownload: downloadLogic.handleDownload,
    handleBatchDownload,
    pauseDownload: downloadLogic.pauseDownload,
    resumeDownload: downloadLogic.resumeDownload,
    cancelDownload: downloadLogic.cancelDownload,
    getTaskStatus: downloadLogic.getTaskStatus,

    // 平台逻辑
    handlePlatformChange: platformLogic.handlePlatformChange,
    handleTypeChange,
    getAvailablePlatforms: platformLogic.getAvailablePlatforms,
    checkPlatformAvailability: platformLogic.checkPlatformAvailability
  };
}