// 统一接口定义 - 简化版本

// ==================== 核心类型定义 ====================

/**
 * 文件类型枚举
 */
export type FileType = "audio" | "video" | "document" | "software" | "image" | "archive" | "other";

/**
 * 下载任务状态
 */
export type DownloadStatus = "pending" | "downloading" | "completed" | "failed" | "paused" | "cancelled";

/**
 * 平台信息
 */
export interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedFileTypes: FileType[];
  isEnabled: boolean;
  priority: number;
  maxConcurrentDownloads?: number;
  requiresAuth?: boolean;
}

/**
 * 搜索项
 */
export interface SearchItem {
  id: string;
  title: string;
  url: string;
  platform: string;
  fileType: FileType;
  size?: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  uploader?: string;
  uploadDate?: string;
  quality?: string;
  format?: string;
  metadata?: Record<string, any>;
}

/**
 * 下载任务详情
 */
export interface DownloadTask {
  id: string;
  url: string;
  filename: string;
  platform: string;
  fileType: FileType;
  progress: number;
  status: DownloadStatus;
  speed?: string;
  size?: string;
  downloaded?: string;
  estimatedTime?: string;
  errorDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 核心请求/响应接口 ====================

/**
 * 统一搜索请求
 */
export interface UnifiedSearchRequest {
  query: string;
  platform: string;
  fileType?: FileType;
  page?: number;
  pageSize?: number;
}

/**
 * 统一搜索响应
 */
export interface UnifiedSearchResponse {
  items: SearchItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 统一下载请求
 */
export interface UnifiedDownloadRequest {
  url: string;
  filename: string;
  platform: string;
  fileType: FileType;
}

/**
 * 统一下载响应
 */
export interface UnifiedDownloadResponse {
  taskId: string;
  status: DownloadStatus;
  message?: string;
}

// ==================== 服务接口定义 ====================

/**
 * 核心搜索操作接口
 */
export interface ISearchOperations {
  search(request: UnifiedSearchRequest): Promise<UnifiedSearchResponse>;
  getSearchSuggestions?(query: string, platform: string): Promise<string[]>;
  getPlatformInfo?(platformId: string): Promise<PlatformInfo | null>;
  getAllPlatforms?(): Promise<PlatformInfo[]>;
  getPlatformsByFileType?(fileType: FileType): Promise<PlatformInfo[]>;
}

/**
 * 核心下载操作接口
 */
export interface IDownloadOperations {
  download(request: UnifiedDownloadRequest): Promise<UnifiedDownloadResponse>;
  getDownloadStatus?(taskId: string): Promise<DownloadTask>;
  cancelDownload?(taskId: string): Promise<void>;
  pauseDownload?(taskId: string): Promise<void>;
  resumeDownload?(taskId: string): Promise<void>;
  getAllDownloads?(): Promise<DownloadTask[]>;
  deleteDownload?(taskId: string): Promise<void>;
  batchDeleteDownloads?(taskIds: string[]): Promise<void>;
  getDownloadStats?(): Promise<{
    total: number;
    completed: number;
    failed: number;
    downloading: number;
    paused: number;
  }>;
  cleanupCompletedTasks?(): Promise<void>;
}