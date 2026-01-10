import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileType } from '../types/unified-interface'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将文件类型映射为下载类型
 */
export function mapFileTypeToDownloadType(fileType: FileType): string {
  const mapping: Record<FileType, string> = {
    'audio': 'music',
    'video': 'video',
    'document': 'file',
    'software': 'file',
    'image': 'file',
    'archive': 'file',
    'other': 'file'
  };
  return mapping[fileType];
}

/**
 * 将下载类型映射为文件类型
 */
export function mapDownloadTypeToFileType(downloadType: string): FileType {
  const mapping: Record<string, FileType> = {
    'music': 'audio',
    'video': 'video',
    'file': 'document'
  };
  return mapping[downloadType] || 'other';
}

/**
 * 根据文件类型获取默认格式
 */
export function getDefaultFormat(fileType: FileType): string {
  const mapping: Record<FileType, string> = {
    'audio': 'MP3',
    'video': 'MP4',
    'document': 'PDF',
    'software': 'EXE',
    'image': 'JPG',
    'archive': 'ZIP',
    'other': '未知格式'
  };
  return mapping[fileType];
}

/**
 * 映射支持的平台类型
 */
export function mapSupportedTypes(supportedTypes: string[]): FileType[] {
  const mapping: Record<string, FileType> = {
    'music': 'audio',
    'video': 'video',
    'document': 'document',
    'software': 'software',
    'image': 'image',
    'archive': 'archive'
  };
  
  return supportedTypes.map(type => mapping[type] || 'other').filter((type, index, arr) => 
    arr.indexOf(type) === index
  );
}
