// 下载功能Hook
import { useCallback } from 'react';
import { SearchResult } from '../types';
import { IpcDownloadService } from '../services/IpcDownloadService';
import { UnifiedDownloadRequest } from '../types/unified-interface';

const downloadService = new IpcDownloadService();

export const useDownload = () => {

  // 开始下载单个项目
  const startDownload = useCallback(async (item: SearchResult) => {
    if (!item.url || !item.title) {
      throw new Error('下载项缺少必要信息');
    }

    try {
      const request: UnifiedDownloadRequest = {
        url: item.url,
        filename: item.title,
        fileType: item.type as any,
        platform: item.platform || 'unknown'
      };
      
      const response = await downloadService.download(request);
      const taskId = response.taskId;
      
      console.log(`下载任务已创建: ${taskId}`);
      return taskId;
    } catch (error) {
      console.error('下载启动失败:', error);
      throw new Error(`下载启动失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [downloadService]);

  // 批量下载
  const batchDownload = useCallback(async (items: SearchResult[]) => {
    if (items.length === 0) {
      throw new Error('没有选择任何下载项');
    }

    const results = [];
    
    for (const item of items) {
      try {
        const taskId = await startDownload(item);
        results.push({ item, taskId, success: true });
      } catch (error) {
        results.push({ 
          item, 
          taskId: null, 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        });
      }
    }

    return results;
  }, [startDownload]);

  // 获取任务列表
  const getTasks = useCallback(async () => {
    try {
      const tasks = await downloadService.getAllTasks();
      return tasks;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw new Error(`获取任务列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [downloadService]);

  // 暂停下载
  const pauseDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.pauseDownload(taskId);
      console.log(`下载任务已暂停: ${taskId}`);
    } catch (error) {
      console.error('暂停下载失败:', error);
      throw new Error(`暂停下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [downloadService]);

  // 恢复下载
  const resumeDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.resumeDownload(taskId);
      console.log(`下载任务已恢复: ${taskId}`);
    } catch (error) {
      console.error('恢复下载失败:', error);
      throw new Error(`恢复下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [downloadService]);

  // 取消下载
  const cancelDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.cancelDownload(taskId);
      console.log(`下载任务已取消: ${taskId}`);
    } catch (error) {
      console.error('取消下载失败:', error);
      throw new Error(`取消下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [downloadService]);

  // 验证下载项
  const validateDownloadItem = useCallback((item: SearchResult): string[] => {
    const errors: string[] = [];

    if (!item.url) {
      errors.push('下载项缺少URL');
    }

    if (!item.title) {
      errors.push('下载项缺少标题');
    }

    if (!item.type) {
      errors.push('下载项缺少类型');
    }

    // 验证URL格式
    try {
      new URL(item.url);
    } catch {
      errors.push('URL格式无效');
    }

    return errors;
  }, []);

  return {
    startDownload,
    batchDownload,
    getTasks,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    validateDownloadItem
  };
};