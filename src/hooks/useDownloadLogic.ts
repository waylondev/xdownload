// 下载逻辑Hook
import { useCallback } from 'react';
import { DownloadType } from '../types';
import { useDownloadActions, useUIActions } from '../stores/appStore';
import { IpcDownloadService } from '../services/IpcDownloadService';
import { UnifiedDownloadRequest } from '../types/unified-interface';

const downloadService = new IpcDownloadService();

export function useDownloadLogic() {
  const downloadActions = useDownloadActions();
  const uiActions = useUIActions();

  // 加载任务列表
  const loadTasks = useCallback(async (type: DownloadType) => {
    try {
      uiActions.setLoading(true);
      const tasks = await downloadService.getAllTasks();
      // 将统一接口的DownloadTask转换为应用内的DownloadTask格式
      const appTasks = tasks.map((task: any) => ({
        id: task.id,
        url: task.url,
        filename: task.filename,
        progress: task.progress,
        status: task.status,
        speed: task.speed,
        size: task.size,
        downloaded: task.downloaded,
        type: type, // 添加type字段
        source: task.platform, // 添加source字段
        fileType: task.fileType,
        platform: task.platform,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
      const filteredTasks = appTasks.filter((task: any) => task.type === type);
      downloadActions.setTasks(filteredTasks);
      uiActions.setError(null);
    } catch (error) {
      console.error('加载任务失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '加载任务失败');
    } finally {
      uiActions.setLoading(false);
    }
  }, [downloadActions.setTasks, uiActions.setLoading, uiActions.setError]);

  // 下载单个项目
  const handleDownload = useCallback(async (item: any, type: DownloadType) => {
    try {
      uiActions.setLoading(true);
      uiActions.setError(null);

      const request: UnifiedDownloadRequest = {
        url: item.url,
        filename: item.title,
        fileType: type as any,
        platform: item.platform || 'unknown'
      };
      await downloadService.download(request);
      
      // 重新加载任务列表
      await loadTasks(type);
    } catch (error) {
      console.error('下载失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '下载失败');
    } finally {
      uiActions.setLoading(false);
    }
  }, [loadTasks, uiActions.setLoading, uiActions.setError]);

  // 批量下载
  const handleBatchDownload = useCallback(async (
    selectedResults: string[], 
    searchResults: any[], 
    type: DownloadType
  ) => {
    if (selectedResults.length === 0) {
      uiActions.setError('请先选择要下载的项目');
      return;
    }

    const selectedItems = searchResults.filter(result => 
      selectedResults.includes(result.id)
    );

    try {
      uiActions.setLoading(true);
      uiActions.setError(null);

      const results = await Promise.allSettled(
        selectedItems.map(item => {
          const request: UnifiedDownloadRequest = {
            url: item.url,
            filename: item.title,
            fileType: type as any,
            platform: item.platform || 'unknown'
          };
          return downloadService.download(request);
        })
      );
      
      // 统计成功和失败的下载
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed > 0) {
        uiActions.setError(`下载完成: ${successful} 成功, ${failed} 失败`);
      } else {
        console.log(`所有下载任务已成功创建: ${successful} 个任务`);
      }

      // 重新加载任务列表
      await loadTasks(type);
    } catch (error) {
      console.error('批量下载失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '批量下载失败');
    } finally {
      uiActions.setLoading(false);
    }
  }, [loadTasks, uiActions.setLoading, uiActions.setError]);

  // 暂停下载
  const pauseDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.pauseDownload(taskId);
      console.log(`下载任务已暂停: ${taskId}`);
    } catch (error) {
      console.error('暂停下载失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '暂停下载失败');
    }
  }, [uiActions.setError]);

  // 恢复下载
  const resumeDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.resumeDownload(taskId);
      console.log(`下载任务已恢复: ${taskId}`);
    } catch (error) {
      console.error('恢复下载失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '恢复下载失败');
    }
  }, [uiActions.setError]);

  // 取消下载
  const cancelDownload = useCallback(async (taskId: string) => {
    try {
      await downloadService.cancelDownload(taskId);
      console.log(`下载任务已取消: ${taskId}`);
    } catch (error) {
      console.error('取消下载失败:', error);
      uiActions.setError(error instanceof Error ? error.message : '取消下载失败');
    }
  }, [uiActions.setError]);

  // 获取任务状态
  const getTaskStatus = useCallback(async (taskId: string) => {
    try {
      return await downloadService.getDownloadStatus(taskId);
    } catch (error) {
      console.error('获取任务状态失败:', error);
      return null;
    }
  }, []);

  return {
    loadTasks,
    handleDownload,
    handleBatchDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    getTaskStatus
  };
}