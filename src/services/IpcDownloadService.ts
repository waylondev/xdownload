// IPC下载服务 - 使用统一接口设计
import {
  UnifiedDownloadRequest,
  UnifiedDownloadResponse,
  IDownloadOperations,
  DownloadTask,
  DownloadStatus,
  FileType,
  AppErrorType
} from '../types/unified-interface';
import { DownloadType } from '../types';
import { mapFileTypeToDownloadType } from '../lib/utils';
import { ipcClient } from '../lib/ipc-client';
import { ErrorHandlingService } from './ErrorHandlingService';
import { validate } from '../lib/validators';
import { ERROR_MESSAGES } from '../config/constants';

export class IpcDownloadService implements IDownloadOperations {
  private errorHandler = ErrorHandlingService.getInstance();
  
  /**
   * 开始下载
   */
  async download(request: UnifiedDownloadRequest): Promise<UnifiedDownloadResponse> {
    // 参数验证 - 使用正确的类型转换
    const downloadType = mapFileTypeToDownloadType(request.fileType) as DownloadType;
    const validationErrors = validate.downloadParams(request.url, request.filename, downloadType);
    if (validationErrors.length > 0) {
      const error = new Error(`${ERROR_MESSAGES.INVALID_PARAMS}: ${validationErrors.join(', ')}`);
      this.errorHandler.handleError({
        type: AppErrorType.VALIDATION_ERROR,
        message: error.message,
        code: 'DOWNLOAD_VALIDATION_FAILED',
        details: { request, errors: validationErrors },
        timestamp: new Date()
      });
      throw error;
    }

    try {
      const response = await ipcClient.download({
        url: request.url,
        filename: request.filename,
        fileType: request.fileType,
        platform: request.platform,
        options: request.options
      });
      
      const taskId = response.taskId;

      return {
        taskId,
        status: 'pending' as DownloadStatus,
        message: '下载任务已创建',
        metadata: {
          estimatedSize: request.options?.headers?.['content-length'] ? parseInt(request.options.headers['content-length']) : undefined,
          downloadOptions: request.options
        }
      };
    } catch (error) {
      const errorMessage = `开始下载失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'DOWNLOAD_START_FAILED',
        details: { request, error },
        timestamp: new Date()
      });
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
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'DOWNLOAD_STATUS_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
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
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'DOWNLOAD_CANCEL_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
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
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'DOWNLOAD_PAUSE_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
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
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'DOWNLOAD_RESUME_FAILED',
        details: { taskId, error },
        timestamp: new Date()
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<DownloadTask[]> {
    try {
      const tasks = await ipcClient.getAllTasks();
      return tasks.map(task => ({
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
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      const errorMessage = `获取任务列表失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'GET_ALL_TASKS_FAILED',
        details: { error },
        timestamp: new Date()
      });
      return [];
    }
  }

  /**
   * 根据状态获取任务
   */
  async getTasksByStatus(status: DownloadStatus): Promise<DownloadTask[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => task.status === status);
    } catch (error) {
      const errorMessage = `根据状态获取任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'GET_TASKS_BY_STATUS_FAILED',
        details: { status, error },
        timestamp: new Date()
      });
      return [];
    }
  }

  /**
   * 根据平台获取任务
   */
  async getTasksByPlatform(platform: string): Promise<DownloadTask[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => task.platform === platform);
    } catch (error) {
      const errorMessage = `根据平台获取任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'GET_TASKS_BY_PLATFORM_FAILED',
        details: { platform, error },
        timestamp: new Date()
      });
      return [];
    }
  }

  /**
   * 根据文件类型获取任务
   */
  async getTasksByFileType(fileType: FileType): Promise<DownloadTask[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => task.fileType === fileType);
    } catch (error) {
      const errorMessage = `根据文件类型获取任务失败: ${error instanceof Error ? error.message : 'IPC调用失败'}`;
      this.errorHandler.handleError({
        type: AppErrorType.DOWNLOAD_ERROR,
        message: errorMessage,
        code: 'GET_TASKS_BY_FILE_TYPE_FAILED',
        details: { fileType, error },
        timestamp: new Date()
      });
      return [];
    }
  }

  // 使用公共映射方法，不再重复实现


}