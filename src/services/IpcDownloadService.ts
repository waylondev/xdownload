// IPC下载服务 - 简化版本
import {
  UnifiedDownloadRequest,
  UnifiedDownloadResponse,
  IDownloadOperations,
  DownloadTask,
  DownloadStatus
} from '../types/unified-interface';
import { ipcClient } from '../lib/ipc-client';

export class IpcDownloadService implements IDownloadOperations {
  
  /**
   * 开始下载
   */
  async download(request: UnifiedDownloadRequest): Promise<UnifiedDownloadResponse> {
    try {
      const response = await ipcClient.download(request);
      
      return {
        taskId: response.taskId,
        status: 'pending' as DownloadStatus,
        message: '下载任务已创建'
      };
    } catch (error) {
      const errorMessage = `开始下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取下载状态
   */
  async getDownloadStatus(taskId: string): Promise<DownloadTask> {
    try {
      const task = await ipcClient.getTaskById(taskId);
      if (!task) {
        throw new Error(`任务 ${taskId} 不存在`);
      }
      
      return {
        id: task.id,
        url: task.url,
        filename: task.filename,
        platform: task.platform,
        fileType: task.fileType,
        progress: task.progress,
        status: task.status,
        speed: task.speed,
        size: task.size,
        downloaded: task.downloaded,
        estimatedTime: task.estimatedTime,
        errorDetails: task.errorDetails,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      const errorMessage = `获取下载进度失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 取消下载
   */
  async cancelDownload(taskId: string): Promise<void> {
    try {
      await ipcClient.cancelDownload(taskId);
    } catch (error) {
      const errorMessage = `取消下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 暂停下载
   */
  async pauseDownload(taskId: string): Promise<void> {
    try {
      await ipcClient.pauseDownload(taskId);
    } catch (error) {
      const errorMessage = `暂停下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 恢复下载
   */
  async resumeDownload(taskId: string): Promise<void> {
    try {
      await ipcClient.resumeDownload(taskId);
    } catch (error) {
      const errorMessage = `恢复下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取所有下载任务
   */
  async getAllDownloads(): Promise<DownloadTask[]> {
    try {
      const tasks = await ipcClient.getAllDownloads();
      return tasks.map((task: any) => ({
        id: task.id,
        url: task.url,
        filename: task.filename,
        platform: task.platform,
        fileType: task.fileType,
        progress: task.progress,
        status: task.status,
        speed: task.speed,
        size: task.size,
        downloaded: task.downloaded,
        estimatedTime: task.estimatedTime,
        errorDetails: task.errorDetails,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      const errorMessage = `获取所有下载任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 删除下载任务
   */
  async deleteDownload(taskId: string): Promise<void> {
    try {
      await ipcClient.deleteDownload(taskId);
    } catch (error) {
      const errorMessage = `删除下载任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 批量删除下载任务
   */
  async batchDeleteDownloads(taskIds: string[]): Promise<void> {
    try {
      await ipcClient.batchDeleteDownloads(taskIds);
    } catch (error) {
      const errorMessage = `批量删除下载任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取下载统计信息
   */
  async getDownloadStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    downloading: number;
    paused: number;
  }> {
    try {
      return await ipcClient.getDownloadStats();
    } catch (error) {
      const errorMessage = `获取下载统计信息失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 清理已完成的任务
   */
  async cleanupCompletedTasks(): Promise<void> {
    try {
      await ipcClient.cleanupCompletedTasks();
    } catch (error) {
      const errorMessage = `清理已完成任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      throw new Error(errorMessage);
    }
  }
}