// 应用常量配置 - 消除硬编码
export const DEFAULT_STRINGS = {
  UNKNOWN_TITLE: '未知标题',
  UNKNOWN_SIZE: '未知大小',
  UNKNOWN_DURATION: '未知时长',
  UNKNOWN_UPLOADER: '未知上传者',
  UNKNOWN_FORMAT: '未知格式',
  DEFAULT_QUALITY: '标准',
  DEFAULT_PLATFORM: 'all',
} as const;

export const DEFAULT_VALUES = {
  PAGE_SIZE: 10,
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,
  STALE_TIME: 5 * 60 * 1000, // 5分钟
  GC_TIME: 10 * 60 * 1000, // 10分钟
  REFETCH_INTERVAL: 5000, // 5秒
} as const;

export const ERROR_MESSAGES = {
  INVALID_PARAMS: '参数无效',
  SEARCH_FAILED: '搜索失败',
  DOWNLOAD_FAILED: '下载失败',
  PLATFORM_UNAVAILABLE: '平台不可用',
  NETWORK_ERROR: '网络错误',
} as const;

export const FORMAT_CONFIG = {
  MUSIC: 'MP3',
  VIDEO: 'MP4',
  FILE: '未知格式',
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const ERROR_CATEGORIES = {
  UI: 'ui',
  API: 'api',
  NETWORK: 'network',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
} as const;