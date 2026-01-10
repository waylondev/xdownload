// 应用配置管理
export const APP_CONFIG = {
  // 搜索配置
  search: {
    defaultPageSize: 10,
    maxPageSize: 50,
    debounceTime: 300, // 搜索防抖时间(ms)
    minQueryLength: 1,
    maxQueryLength: 200,
  },
  
  // 下载配置
  download: {
    maxConcurrentDownloads: 3,
    retryAttempts: 3,
    retryDelay: 2000, // 重试延迟(ms)
    maxFilenameLength: 255,
  },
  
  // 平台配置
  platforms: {
    defaultPlatform: 'all',
    supportedTypes: ['music', 'video', 'file'] as const,
  },
  
  // UI配置
  ui: {
    defaultTheme: 'light',
    animationDuration: 200,
    toastDuration: 3000,
    loadingDelay: 500, // 显示loading的最小延迟
  },
  
  // 缓存配置
  cache: {
    searchResults: 5 * 60 * 1000, // 5分钟
    platformList: 30 * 60 * 1000, // 30分钟
    popularSearches: 60 * 60 * 1000, // 1小时
  },
} as const;

// 类型定义
export type DownloadType = typeof APP_CONFIG.platforms.supportedTypes[number];

export type PlatformConfig = {
  id: string;
  name: string;
  type: DownloadType;
  icon: string;
  enabled: boolean;
  searchUrl?: string;
  apiKeyRequired: boolean;
};

// 平台配置列表 - 从JSON文件动态获取
// 平台配置将通过PlatformService从JSON文件或后端API获取
export const PLATFORM_CONFIGS: PlatformConfig[] = [];

// 获取特定类型的平台列表
export async function getPlatformsByType(type: DownloadType): Promise<PlatformConfig[]> {
  return PLATFORM_CONFIGS.filter(platform => platform.type === type);
}

// 获取所有平台列表
export async function getAllPlatforms(): Promise<PlatformConfig[]> {
  return PLATFORM_CONFIGS;
}

// 根据平台ID获取配置
export async function getPlatformById(id: string): Promise<PlatformConfig | null> {
  const platform = PLATFORM_CONFIGS.find(p => p.id === id);
  return platform || null;
}

// 检查平台是否可用
export async function isPlatformAvailable(platformId: string): Promise<boolean> {
  const platform = await getPlatformById(platformId);
  return platform !== null && platform.enabled !== false;
}

// 获取支持的平台类型
export async function getSupportedTypes(): Promise<DownloadType[]> {
  return [...new Set(PLATFORM_CONFIGS.map(platform => platform.type))];
}