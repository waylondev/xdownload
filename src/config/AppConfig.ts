// 应用配置管理 - 提取所有硬编码常量
export const AppConfig = {
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    minPageSize: 1
  },

  // 下载配置
  download: {
    maxConcurrentDownloads: 3,
    defaultRetryCount: 3,
    defaultTimeout: 30000,
    chunkSize: 1024 * 1024, // 1MB
    maxFileSize: 1024 * 1024 * 1024 // 1GB
  },

  // 搜索配置
  search: {
    debounceTime: 300,
    maxSuggestions: 10,
    cacheDuration: 5 * 60 * 1000 // 5分钟
  },

  // 平台配置
  platforms: {
    defaultPlatform: 'all',
    supportedTypes: ['music', 'video', 'file'] as const
  },

  // UI配置
  ui: {
    loadingDelay: 200,
    errorDisplayTime: 5000,
    animationDuration: 300
  },

  // 性能配置
  performance: {
    enableVirtualization: true,
    virtualizationThreshold: 50,
    enableLazyLoading: true,
    lazyLoadingThreshold: 10
  },

  // 错误消息配置
  errorMessages: {
    search: {
      emptyQuery: '搜索查询不能为空',
      failed: '搜索失败',
      networkError: '网络连接失败，请检查网络设置'
    },
    download: {
      noSelection: '请先选择要下载的项目',
      failed: '下载失败',
      networkError: '网络连接失败，请检查网络设置',
      fileNotFound: '文件不存在或已被删除'
    },
    task: {
      loadFailed: '加载任务失败',
      notFound: '任务不存在'
    },
    platform: {
      notAvailable: '平台暂不可用',
      invalidConfig: '平台配置无效'
    }
  },

  // 成功消息配置
  successMessages: {
    download: {
      started: '下载任务已开始',
      completed: '下载完成',
      batchCompleted: (successful: number, failed: number) => 
        `下载完成: ${successful} 成功, ${failed} 失败`
    },
    search: {
      completed: '搜索完成'
    }
  }
} as const;

// 类型定义
export type DownloadType = typeof AppConfig.platforms.supportedTypes[number];
export type PlatformId = string;

// 配置验证器
export class ConfigValidator {
  static validatePageSize(size: number): boolean {
    return size >= AppConfig.pagination.minPageSize && 
           size <= AppConfig.pagination.maxPageSize;
  }

  static validateRetryCount(count: number): boolean {
    return count >= 0 && count <= 10;
  }

  static validateTimeout(timeout: number): boolean {
    return timeout >= 1000 && timeout <= 60000;
  }

  static validateDownloadType(type: string): type is DownloadType {
    return AppConfig.platforms.supportedTypes.includes(type as DownloadType);
  }
}

// 配置管理器
export class ConfigManager {
  private static instance: ConfigManager;
  private config = { ...AppConfig };

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 获取配置
  getConfig() {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(updates: Partial<typeof AppConfig>) {
    this.config = { ...this.config, ...updates };
    console.log('配置已更新:', updates);
  }

  // 重置配置
  resetConfig() {
    this.config = { ...AppConfig };
    console.log('配置已重置');
  }

  // 获取特定配置
  getPaginationConfig() {
    return this.config.pagination;
  }

  getDownloadConfig() {
    return this.config.download;
  }

  getSearchConfig() {
    return this.config.search;
  }

  getPlatformConfig() {
    return this.config.platforms;
  }

  getUIConfig() {
    return this.config.ui;
  }

  getPerformanceConfig() {
    return this.config.performance;
  }

  // 验证配置
  validateConfig() {
    const errors: string[] = [];

    if (!ConfigValidator.validatePageSize(this.config.pagination.defaultPageSize)) {
      errors.push('默认分页大小无效');
    }

    if (!ConfigValidator.validateRetryCount(this.config.download.defaultRetryCount)) {
      errors.push('默认重试次数无效');
    }

    if (!ConfigValidator.validateTimeout(this.config.download.defaultTimeout)) {
      errors.push('默认超时时间无效');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}