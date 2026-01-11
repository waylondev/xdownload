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
      const result = await this.invokeTauriCommand<any>('search', {
        request: {
          query: request.query,
          platform: request.platform,
          file_type: request.fileType,
          page: request.page || 1,
          page_size: request.pageSize || 20
        }
      });

      return {
        items: result.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          platform: item.platform,
          fileType: item.file_type || 'file',
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
      throw new Error(errorMessage);
    }
  }

  async getSearchSuggestions(query: string, platform: string): Promise<string[]> {
    try {
      return await this.invokeTauriCommand<string[]>('get_search_suggestions', {
        query,
        platform
      });
    } catch (error) {
      const errorMessage = `获取搜索建议失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  // 下载相关方法
  async download(request: UnifiedDownloadRequest): Promise<UnifiedDownloadResponse> {
    try {
      const taskId = await this.invokeTauriCommand<string>('start_download', {
        request: {
          url: request.url,
          filename: request.filename,
          download_type: request.fileType,
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
      throw new Error(errorMessage);
    }
  }

  async getTaskById(taskId: string): Promise<DownloadTask | null> {
    try {
      const task = await this.invokeTauriCommand<any>('get_task_by_id', { taskId });
      if (!task) return null;

      return {
        id: task.id,
        url: task.url,
        filename: task.filename,
        platform: task.platform,
        fileType: task.file_type || 'file',
        progress: task.progress,
        status: task.status,
        speed: task.speed,
        size: task.size,
        downloaded: task.downloaded,
        estimatedTime: task.estimated_time,
        errorDetails: task.error_details,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      };
    } catch (error) {
      const errorMessage = `获取任务详情失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async cancelDownload(taskId: string): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('cancel_download', { taskId });
    } catch (error) {
      const errorMessage = `取消下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async pauseDownload(taskId: string): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('pause_download', { taskId });
    } catch (error) {
      const errorMessage = `暂停下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async resumeDownload(taskId: string): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('resume_download', { taskId });
    } catch (error) {
      const errorMessage = `恢复下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async getAllTasks(): Promise<DownloadTask[]> {
    try {
      const tasks = await this.invokeTauriCommand<any[]>('get_all_tasks');
      return tasks.map(task => ({
        id: task.id,
        url: task.url,
        filename: task.filename,
        platform: task.platform,
        fileType: task.file_type || 'file',
        progress: task.progress,
        status: task.status,
        speed: task.speed,
        size: task.size,
        downloaded: task.downloaded,
        estimatedTime: task.estimated_time,
        errorDetails: task.error_details,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));
    } catch (error) {
      const errorMessage = `获取所有任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async deleteDownload(taskId: string): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('delete_download', { taskId });
    } catch (error) {
      const errorMessage = `删除下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async batchDeleteDownloads(taskIds: string[]): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('batch_delete_downloads', { taskIds });
    } catch (error) {
      const errorMessage = `批量删除下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async getDownloadStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    downloading: number;
    paused: number;
  }> {
    try {
      return await this.invokeTauriCommand<any>('get_download_stats');
    } catch (error) {
      const errorMessage = `获取下载统计失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  async cleanupCompletedTasks(): Promise<void> {
    try {
      await this.invokeTauriCommand<void>('cleanup_completed_tasks');
    } catch (error) {
      const errorMessage = `清理已完成任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  // 平台相关方法
  async getPlatforms(): Promise<any[]> {
    try {
      return await this.invokeTauriCommand<any[]>('get_platforms');
    } catch (error) {
      const errorMessage = `获取平台列表失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }
}

// 导出单例实例
export const ipcClient = new SimpleIpcClient();