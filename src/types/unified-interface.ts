// 统一接口定义 - 极简设计，预留扩展

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
  // 预留扩展字段
  options?: {
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
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
  // 预留扩展字段
  metadata?: {
    searchTime?: number;
    platformInfo?: PlatformInfo;
    suggestions?: string[];
  };
}

/**
 * 统一下载请求
 */
export interface UnifiedDownloadRequest {
  url: string;
  filename: string;
  platform: string;
  fileType: FileType;
  // 预留扩展字段
  options?: {
    quality?: string;
    format?: string;
    outputPath?: string;
    headers?: Record<string, string>;
    cookies?: string;
  };
}

/**
 * 统一下载响应
 */
export interface UnifiedDownloadResponse {
  taskId: string;
  status: DownloadStatus;
  message?: string;
  // 预留扩展字段
  metadata?: {
    estimatedSize?: number;
    availableFormats?: string[];
    downloadOptions?: Record<string, any>;
  };
}

// ==================== 扩展接口（预留） ====================

/**
 * 批量下载请求（预留）
 */
export interface BatchDownloadRequest {
  items: Array<{
    url: string;
    filename: string;
    platform: string;
    fileType: FileType;
  }>;
  options?: {
    concurrentLimit?: number;
    outputDirectory?: string;
    onComplete?: (result: BatchDownloadResult) => void;
  };
}

/**
 * 批量下载响应（预留）
 */
export interface BatchDownloadResult {
  total: number;
  success: number;
  failed: number;
  tasks: DownloadTask[];
}

/**
 * 高级搜索请求（预留）
 */
export interface AdvancedSearchRequest extends UnifiedSearchRequest {
  filters?: {
    duration?: { min?: number; max?: number };
    size?: { min?: number; max?: number };
    quality?: string[];
    uploadDate?: { start?: Date; end?: Date };
    language?: string[];
  };
  sortBy?: 'relevance' | 'date' | 'size' | 'duration' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// ==================== 服务接口定义 ====================

/**
 * 核心搜索操作接口
 */
export interface ISearchOperations {
  search(request: UnifiedSearchRequest): Promise<UnifiedSearchResponse>;
  getSearchSuggestions?(query: string, platform: string): Promise<string[]>;
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
}

/**
 * 平台管理接口
 */
export interface IPlatformOperations {
  getAllPlatforms(): Promise<PlatformInfo[]>;
  getPlatformsByFileType(fileType: FileType): Promise<PlatformInfo[]>;
  getPlatformInfo(platformId: string): Promise<PlatformInfo | null>;
  enablePlatform(platformId: string): Promise<void>;
  disablePlatform(platformId: string): Promise<void>;
}

/**
 * 任务查询接口
 */
export interface ITaskQueryOperations {
  getAllTasks(): Promise<DownloadTask[]>;
  getTasksByStatus(status: DownloadStatus): Promise<DownloadTask[]>;
  getTasksByPlatform(platform: string): Promise<DownloadTask[]>;
  getTasksByFileType(fileType: FileType): Promise<DownloadTask[]>;
}

// ==================== 统一服务接口 ====================

/**
 * 统一应用服务接口
 * 整合所有核心操作，提供统一的API入口
 */
export interface IUnifiedAppService {
  // 核心操作
  search: ISearchOperations['search'];
  download: IDownloadOperations['download'];
  
  // 平台管理
  platform: IPlatformOperations;
  
  // 任务管理
  tasks: ITaskQueryOperations;
  
  // 可选的高级操作（预留）
  advancedSearch?(request: AdvancedSearchRequest): Promise<UnifiedSearchResponse>;
  batchDownload?(request: BatchDownloadRequest): Promise<BatchDownloadResult>;
  
  // 事件系统（预留）
  on?(event: string, listener: Function): void;
  off?(event: string, listener: Function): void;
}

// ==================== 错误类型定义 ====================

/**
 * 应用错误类型
 */
export enum AppErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PLATFORM_ERROR = 'PLATFORM_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DOWNLOAD_ERROR = 'DOWNLOAD_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 统一错误响应
 */
export interface AppError {
  type: AppErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

// ==================== 工具类型 ====================

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 通用响应包装器
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  metadata?: {
    timestamp: Date;
    requestId?: string;
  };
}

export type { DownloadType } from './index';