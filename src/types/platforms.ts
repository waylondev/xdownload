// 平台类型定义 - 从JSON文件动态获取
// 这些类型将根据实际平台数据动态生成
export type PlatformType = string;

// 平台类型枚举
export enum PlatformCategory {
  MUSIC = "music",
  VIDEO = "video", 
  FILE = "file"
}

// 平台配置接口
export interface PlatformConfig {
  id: string;
  name: string;
  type: "music" | "video" | "file";
  icon: string;
  description: string;
  enabled: boolean;
  apiEndpoint?: string;
  searchDelay: number;
  maxResults: number;
  supportedTypes: string[];
  priority: number;
}

// 平台选择器类型
export interface PlatformSelector {
  type: "music" | "video" | "file";
  platforms: PlatformConfig[];
  defaultPlatform: string;
}

// 平台数据将通过PlatformService从JSON文件或后端API获取
// 这里只保留类型定义，实际数据通过服务层获取