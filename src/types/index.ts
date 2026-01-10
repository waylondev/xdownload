// 下载类型枚举
export type DownloadType = "music" | "video" | "file";

// 下载任务状态枚举
export type DownloadStatus = "pending" | "downloading" | "completed" | "failed" | "paused";

// 下载任务类型定义
export interface DownloadTask {
  id: string;
  url: string;
  filename: string;
  title?: string; // 兼容性字段
  progress: number;
  status: DownloadStatus;
  speed: string;
  size: string;
  downloaded: string;
  type: DownloadType;
  platform: string; // 新增平台字段
  source: string; // 新增来源字段
  eta?: string; // 预计完成时间
  errorDetails?: string; // 错误详情
  createdAt: Date;
  updatedAt: Date;
}

// 搜索结果类型定义
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  platform: string; // 新增平台字段
  duration?: string;
  quality?: string;
  size?: string;
  thumbnail?: string;
  artist?: string;
  album?: string;
  source?: string; // 新增来源信息
  description?: string;
  uploader?: string;
  uploadDate?: string;
  format?: string;
  downloadProgress?: number;
  
  // 通用文件属性
  fileType?: string;
  resolution?: string;
  bitrate?: string;
  views?: number;
  likes?: number;
  
  // 音频/视频特有属性
  genre?: string;
  year?: number;
  codec?: string;
  sampleRate?: string;
  channels?: number;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页结果类型
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 搜索参数类型（新增）
export interface SearchParams extends PaginationParams {
  query: string;
  type: DownloadType;
  platform: string; // 平台选择
  filters?: Record<string, any>; // 过滤条件
}

// 平台相关类型（从platforms.ts导入）
export type {
  PlatformType,
  PlatformConfig,
  PlatformSelector,
  PlatformCategory
} from "./platforms";

// 搜索配置类型
export interface SearchConfig {
  enabledPlatforms: string[];
  defaultPlatform: string;
  searchTimeout: number;
  maxResults: number;
}

// 下载配置类型
export interface DownloadConfig {
  downloadPath: string;
  maxConcurrentDownloads: number;
  autoStart: boolean;
  retryCount: number;
}

// 应用设置类型
export interface AppSettings {
  search: SearchConfig;
  download: DownloadConfig;
  theme: "light" | "dark" | "auto";
  language: string;
}

// 平台信息类型
export interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  description?: string;
  supportedTypes?: string[];
  isEnabled?: boolean;
}