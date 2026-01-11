// Tauri IPC客户端 - 简化版本
import {
  UnifiedSearchRequest,
  UnifiedSearchResponse,
  UnifiedDownloadRequest,
  UnifiedDownloadResponse,
  DownloadTask
} from '../types/unified-interface';
import { invoke } from '@tauri-apps/api/core';

// Tauri IPC客户端实现 - 简化版本
class SimpleIpcClient {
  // 封装Tauri invoke调用
  private async invokeTauriCommand<T>(command: string, args?: any): Promise<T> {
    return await invoke<T>(command, args);
  }

  // 搜索相关方法
  async search(request: UnifiedSearchRequest): Promise<UnifiedSearchResponse> {
    try {
      // 使用Tauri IPC调用后端搜索功能 - 传递完整的request对象
      const result = await this.invokeTauriCommand<any>('search', {
        request: {
          query: request.query,
          platform: request.platform,
          file_type: request.fileType,
          page: request.page || 1,
          page_size: request.pageSize || 20
        }
      });

      // 转换响应格式
      return {
        items: result.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          platform: item.platform,
          fileType: mapDownloadTypeToFileType(item.file_type || 'file'),
          size: item.size,
          duration: item.duration,
          thumbnail: item.thumbnail,
          description: item.description,
          uploader: item.uploader,
          uploadDate: item.upload_date,
          quality: item.quality,
          format: item.format,
          metadata: item.metadata || {}
        })),
        total: result.total || 0,
        page: result.page || 1,
        pageSize: result.page_size || 20,
        totalPages: result.total_pages || 0
      };
    } catch (error) {
      const errorMessage = `搜索失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.SEARCH_ERROR,
        message: errorMessage,
        code: 'IPC_SEARCH_FAILED',
        details: { request, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  async getSearchSuggestions(query: string, platform: string): Promise<string[]> {
    try {
      // 使用Tauri IPC调用后端搜索建议功能
      return await this.invokeTauriCommand<string[]>('get_search_suggestions', {
        query,
        platform
      });
    } catch (error) {
      const errorMessage = `获取搜索建议失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.SEARCH_ERROR,
        message: errorMessage,
        code: 'IPC_SUGGESTIONS_FAILED',
        details: { query, platform, error },
        timestamp: new Date()
      });
      return [];
    }
  }

  // 下载相关方法
  async download(request: UnifiedDownloadRequest): Promise<UnifiedDownloadResponse> {
    try {
      // 使用Tauri IPC调用后端下载功能 - 传递完整的request对象
      const taskId = await this.invokeTauriCommand<string>('start_download', {
        request: {
          url: request.url,
          filename: request.filename,
          download_type: mapFileTypeToDownloadType(request.fileType),
          platform: request.platform
        }
      });

      return {
        taskId,
        status: 'pending',
        message: '下载任务已创建'
      };
    } catch (error) {
      const errorMessage = `开始下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_DOWNLOAD_START_FAILED',
        details: { request, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  async pauseDownload(taskId: string): Promise<void> {
    try {
      // 使用Tauri IPC调用后端暂停下载功能 - 参数名使用snake_case匹配后端
      await this.invokeTauriCommand<void>('pause_download', { task_id: taskId });
    } catch (error) {
      const errorMessage = `暂停下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_PAUSE_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  async resumeDownload(taskId: string): Promise<void> {
    try {
      // 使用Tauri IPC调用后端恢复下载功能
      await this.invokeTauriCommand<void>('resume_download', { taskId });
    } catch (error) {
      const errorMessage = `恢复下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_RESUME_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  async cancelDownload(taskId: string): Promise<void> {
    try {
      // 使用Tauri IPC调用后端取消下载功能
      await this.invokeTauriCommand<void>('cancel_download', { taskId });
    } catch (error) {
      const errorMessage = `取消下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_CANCEL_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  // 任务查询相关方法
  async getAllTasks(): Promise<DownloadTask[]> {
    try {
      // 使用Tauri IPC调用后端获取所有任务
      const tasks = await this.invokeTauriCommand<any[]>('get_download_tasks');
      return tasks.map((task: any) => ({
        id: task.id,
        url: task.url,
        filename: task.filename,
        progress: task.progress || 0,
        status: task.status || 'pending',
        speed: task.speed || '0 KB/s',
        size: task.size || '未知',
        downloaded: task.downloaded || '0B',
        fileType: mapDownloadTypeToFileType(task.download_type || 'file'),
        platform: task.platform || 'default',
        createdAt: new Date((task.created_at || Date.now()) * 1000), // 转换为毫秒级时间戳
        updatedAt: new Date((task.updated_at || Date.now()) * 1000) // 转换为毫秒级时间戳
      }));
    } catch (error) {
      const errorMessage = `获取下载任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_GET_TASKS_FAILED',
        details: { error },
        timestamp: new Date()
      });
      return [];
    }
  }

  async getTaskById(taskId: string): Promise<DownloadTask | null> {
    try {
      // 使用Tauri IPC调用后端获取单个任务
      const task = await this.invokeTauriCommand<any>('get_download_task', { taskId });
      if (!task) return null;

      return {
        id: task.id,
        url: task.url,
        filename: task.filename,
        progress: task.progress || 0,
        status: task.status || 'pending',
        speed: task.speed || '0 KB/s',
        size: task.size || '未知',
        downloaded: task.downloaded || '0B',
        fileType: mapDownloadTypeToFileType(task.download_type || 'file'),
        platform: task.platform || 'default',
        createdAt: new Date((task.created_at || Date.now()) * 1000), // 转换为毫秒级时间戳
        updatedAt: new Date((task.updated_at || Date.now()) * 1000) // 转换为毫秒级时间戳
      };
    } catch (error) {
      const errorMessage = `获取下载任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'IPC_GET_TASK_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
      return null;
    }
  }

  // 平台相关方法
  async getPlatforms(): Promise<any[]> {
    try {
      // 使用Tauri IPC调用后端获取平台列表
      return await this.invokeTauriCommand<any[]>('get_platforms');
    } catch (error) {
      const errorMessage = `获取平台列表失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.PLATFORM_ERROR,
        message: errorMessage,
        code: 'IPC_GET_PLATFORMS_FAILED',
        details: { error },
        timestamp: new Date()
      });
      return [];
    }
  }
}

// 导出全局IPC客户端实例
export const ipcClient = new SimpleIpcClient();

// 导出类供测试使用
export { SimpleIpcClient as IpcClient };