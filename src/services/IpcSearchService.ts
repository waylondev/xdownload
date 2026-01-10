// IPC搜索服务 - 使用统一接口设计
import { 
  UnifiedSearchRequest, 
  UnifiedSearchResponse, 
  ISearchOperations,
  FileType,
  PlatformInfo,
  AppErrorType
} from '../types/unified-interface';
import { ErrorHandlingService } from './ErrorHandlingService';
import { validate } from '../lib/validators';
import { ERROR_MESSAGES } from '../config/constants';
import { ipcClient } from '../lib/ipc-client';
import { mapSupportedTypes } from '../lib/utils';

export class IpcSearchService implements ISearchOperations {
  private errorHandler = ErrorHandlingService.getInstance();
  
  /**
   * 执行搜索
   */
  async search(request: UnifiedSearchRequest): Promise<UnifiedSearchResponse> {
    // 参数验证
    const validationErrors = [
      ...validate.searchQuery(request.query),
      ...validate.platform(request.platform),
      ...validate.pagination(request.page || 1, request.pageSize || 20)
    ];
    
    if (validationErrors.length > 0) {
      const error = new Error(`${ERROR_MESSAGES.INVALID_PARAMS}: ${validationErrors.join(', ')}`);
      this.errorHandler.handleError({
        type: AppErrorType.VALIDATION_ERROR,
        message: error.message,
        code: 'SEARCH_VALIDATION_FAILED',
        details: { request, errors: validationErrors },
        timestamp: new Date()
      });
      throw error;
    }

    try {
      // 调用真实后端API
      const response = await ipcClient.search(request);
      return response;
    } catch (error) {
      const errorMessage = `搜索失败: ${error instanceof Error ? error.message : '服务调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.SEARCH_ERROR,
        message: errorMessage,
        code: 'SEARCH_FAILED',
        details: { request, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string, platform: string): Promise<string[]> {
    try {
      // 调用真实后端API
      return await ipcClient.getSearchSuggestions(query, platform);
    } catch (error) {
      const errorMessage = `获取搜索建议失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.SEARCH_ERROR,
        message: errorMessage,
        code: 'SUGGESTIONS_FAILED',
        details: { query, platform, error },
        timestamp: new Date()
      });
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
        supportedFileTypes: mapSupportedTypes(platform.supported_types),
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      };
    } catch (error) {
      const errorMessage = `获取平台信息失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.PLATFORM_ERROR,
        message: errorMessage,
        code: 'PLATFORM_INFO_FAILED',
        details: { platformId, error },
        timestamp: new Date()
      });
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
        supportedFileTypes: mapSupportedTypes(platform.supported_types),
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      }));
    } catch (error) {
      const errorMessage = `获取所有平台失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.PLATFORM_ERROR,
        message: errorMessage,
        code: 'ALL_PLATFORMS_FAILED',
        details: { error },
        timestamp: new Date()
      });
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
        supportedFileTypes: mapSupportedTypes(platform.supported_types),
        isEnabled: platform.is_enabled !== false,
        priority: platform.priority || 1,
        maxConcurrentDownloads: platform.max_concurrent_downloads,
        requiresAuth: platform.requires_auth
      }));
    } catch (error) {
      const errorMessage = `根据文件类型获取平台失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.PLATFORM_ERROR,
        message: errorMessage,
        code: 'PLATFORMS_BY_TYPE_FAILED',
        details: { fileType, error },
        timestamp: new Date()
      });
      return [];
    }
  }


}