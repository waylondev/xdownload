// IPC搜索服务 - 简化版本
import { 
  UnifiedSearchRequest, 
  UnifiedSearchResponse, 
  ISearchOperations,
  FileType,
  PlatformInfo
} from '../types/unified-interface';
import { ipcClient } from '../lib/ipc-client';

export class IpcSearchService implements ISearchOperations {
  
  /**
   * 执行搜索
   */
  async search(request: UnifiedSearchRequest): Promise<UnifiedSearchResponse> {
    try {
      const response = await ipcClient.search(request);
      return response;
    } catch (error) {
      const errorMessage = `搜索失败: ${error instanceof Error ? error.message : '服务调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string, platform: string): Promise<string[]> {
    try {
      return await ipcClient.getSearchSuggestions(query, platform);
    } catch (error) {
      const errorMessage = `获取搜索建议失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取平台信息
   */
  async getPlatformInfo(platformId: string): Promise<PlatformInfo | null> {
    try {
      const platforms = await ipcClient.getPlatforms();
      const platform = platforms.find((p: any) => p.id === platformId);
      if (!platform) return null;

      return {
        id: platform.id,
        name: platform.name,
        icon: platform.icon,
        description: platform.description,
        supportedFileTypes: platform.supported_types || [],
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      };
    } catch (error) {
      console.error('获取平台信息失败:', error);
      return null;
    }
  }

  /**
   * 获取所有平台
   */
  async getAllPlatforms(): Promise<PlatformInfo[]> {
    try {
      const platforms = await ipcClient.getPlatforms();
      return platforms.map((platform: any) => ({
        id: platform.id,
        name: platform.name,
        icon: platform.icon,
        description: platform.description,
        supportedFileTypes: platform.supported_types || [],
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      }));
    } catch (error) {
      console.error('获取所有平台失败:', error);
      return [];
    }
  }

  /**
   * 根据文件类型获取平台
   */
  async getPlatformsByFileType(fileType: FileType): Promise<PlatformInfo[]> {
    try {
      const platforms = await ipcClient.getPlatforms();
      const filteredPlatforms = platforms.filter((platform: any) => 
        platform.supported_types && platform.supported_types.includes(fileType)
      );
      
      return filteredPlatforms.map((platform: any) => ({
        id: platform.id,
        name: platform.name,
        icon: platform.icon,
        description: platform.description,
        supportedFileTypes: platform.supported_types || [],
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      }));
    } catch (error) {
      console.error('根据文件类型获取平台失败:', error);
      return [];
    }
  }
}