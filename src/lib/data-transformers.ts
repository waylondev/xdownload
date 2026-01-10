// 通用的数据转换工具函数 - 消除重复的数据映射逻辑
import { SearchResult, DownloadType } from '../types';
import { DEFAULT_STRINGS, FORMAT_CONFIG } from '../config/constants';

export interface RawSearchItem {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
  platform?: string;
  size?: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  uploader?: string;
  uploadDate?: string;
  quality?: string;
  format?: string;
}

// 通用的搜索结果转换器
export function transformSearchResult(
  item: RawSearchItem, 
  type: DownloadType, 
  platform: string
): SearchResult {
  const now = new Date().toISOString();
  
  return {
    id: item.id || `item_${Date.now()}_${Math.random()}`,
    title: item.title || DEFAULT_STRINGS.UNKNOWN_TITLE,
    url: item.url || '',
    type: item.type || type,
    platform: item.platform || platform,
    size: item.size || DEFAULT_STRINGS.UNKNOWN_SIZE,
    duration: item.duration || DEFAULT_STRINGS.UNKNOWN_DURATION,
    thumbnail: item.thumbnail || '',
    description: item.description || '',
    uploader: item.uploader || DEFAULT_STRINGS.UNKNOWN_UPLOADER,
    uploadDate: item.uploadDate || now,
    quality: item.quality || DEFAULT_STRINGS.DEFAULT_QUALITY,
    format: item.format || getDefaultFormat(type),
  };
}

// 批量转换搜索结果
export function transformSearchResults(
  items: RawSearchItem[], 
  type: DownloadType, 
  platform: string
): SearchResult[] {
  return items.map(item => transformSearchResult(item, type, platform));
}

// 根据类型获取默认格式
function getDefaultFormat(type: DownloadType): string {
  switch (type) {
    case 'music':
      return FORMAT_CONFIG.MUSIC;
    case 'video':
      return FORMAT_CONFIG.VIDEO;
    default:
      return FORMAT_CONFIG.FILE;
  }
}

// 数据验证和清理工具
export function sanitizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

export function validateSearchParams(query: string, type: DownloadType, platform: string): string[] {
  const errors: string[] = [];
  
  if (!query.trim()) {
    errors.push('搜索查询不能为空');
  }
  
  if (query.trim().length < 2) {
    errors.push('搜索查询至少需要2个字符');
  }
  
  if (!['music', 'video', 'file'].includes(type)) {
    errors.push('无效的下载类型');
  }
  
  if (!platform.trim()) {
    errors.push('平台不能为空');
  }
  
  return errors;
}

// 分页数据转换
export function transformPaginationData(
  items: any[], 
  total: number, 
  page: number, 
  pageSize: number
) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}