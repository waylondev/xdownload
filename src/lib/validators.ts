// 统一的验证工具类 - 消除重复的验证逻辑
import { DownloadType } from '../types';
import { ERROR_MESSAGES } from '../config/constants';

export class Validator {
  // URL验证
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 文件名验证
  static isValidFilename(filename: string): boolean {
    const invalidChars = /[<>:"/\\|?*]/;
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    
    return !invalidChars.test(filename) && 
           !reservedNames.test(filename) && 
           filename.trim().length > 0;
  }

  // 搜索查询验证
  static validateSearchQuery(query: string): string[] {
    const errors: string[] = [];
    
    if (!query.trim()) {
      errors.push('搜索查询不能为空');
    }
    
    if (query.trim().length < 2) {
      errors.push('搜索查询至少需要2个字符');
    }
    
    if (query.trim().length > 200) {
      errors.push('搜索查询不能超过200个字符');
    }
    
    return errors;
  }

  // 下载参数验证
  static validateDownloadParams(url: string, filename: string, type: DownloadType): string[] {
    const errors: string[] = [];
    
    if (!this.isValidUrl(url)) {
      errors.push('无效的URL地址');
    }
    
    if (!this.isValidFilename(filename)) {
      errors.push('无效的文件名');
    }
    
    if (!['music', 'video', 'file'].includes(type)) {
      errors.push('无效的下载类型');
    }
    
    return errors;
  }

  // 平台验证
  static validatePlatform(platform: string): string[] {
    const errors: string[] = [];
    
    if (!platform.trim()) {
      errors.push('平台名称不能为空');
    }
    
    if (platform.trim().length > 50) {
      errors.push('平台名称不能超过50个字符');
    }
    
    return errors;
  }

  // 分页参数验证
  static validatePagination(page: number, pageSize: number): string[] {
    const errors: string[] = [];
    
    if (page < 1) {
      errors.push('页码不能小于1');
    }
    
    if (pageSize < 1 || pageSize > 100) {
      errors.push('每页大小必须在1-100之间');
    }
    
    return errors;
  }

  // 通用字符串验证
  static validateString(value: string, fieldName: string, options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}): string[] {
    const errors: string[] = [];
    const { required = true, minLength, maxLength, pattern } = options;
    
    if (required && !value.trim()) {
      errors.push(`${fieldName}不能为空`);
      return errors;
    }
    
    if (minLength && value.trim().length < minLength) {
      errors.push(`${fieldName}至少需要${minLength}个字符`);
    }
    
    if (maxLength && value.trim().length > maxLength) {
      errors.push(`${fieldName}不能超过${maxLength}个字符`);
    }
    
    if (pattern && !pattern.test(value)) {
      errors.push(`${fieldName}格式不正确`);
    }
    
    return errors;
  }

  // 数字验证
  static validateNumber(value: number, fieldName: string, options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}): string[] {
    const errors: string[] = [];
    const { required = true, min, max, integer = false } = options;
    
    if (required && (value === null || value === undefined || isNaN(value))) {
      errors.push(`${fieldName}不能为空`);
      return errors;
    }
    
    if (min !== undefined && value < min) {
      errors.push(`${fieldName}不能小于${min}`);
    }
    
    if (max !== undefined && value > max) {
      errors.push(`${fieldName}不能大于${max}`);
    }
    
    if (integer && !Number.isInteger(value)) {
      errors.push(`${fieldName}必须是整数`);
    }
    
    return errors;
  }

  // 批量验证
  static validateAll(validations: { value: any; validator: (value: any) => string[] }[]): string[] {
    const errors: string[] = [];
    
    for (const validation of validations) {
      const validationErrors = validation.validator(validation.value);
      errors.push(...validationErrors);
    }
    
    return errors;
  }

  // 抛出验证错误
  static throwIfInvalid(errors: string[], context: string = ERROR_MESSAGES.INVALID_PARAMS): void {
    if (errors.length > 0) {
      throw new Error(`${context}: ${errors.join(', ')}`);
    }
  }
}

// 快捷验证函数
export const validate = {
  searchQuery: (query: string) => Validator.validateSearchQuery(query),
  downloadParams: (url: string, filename: string, type: DownloadType) => 
    Validator.validateDownloadParams(url, filename, type),
  platform: (platform: string) => Validator.validatePlatform(platform),
  pagination: (page: number, pageSize: number) => Validator.validatePagination(page, pageSize),
  string: (value: string, fieldName: string, options?: any) => 
    Validator.validateString(value, fieldName, options),
  number: (value: number, fieldName: string, options?: any) => 
    Validator.validateNumber(value, fieldName, options),
};

// 验证装饰器（用于类方法）
export function ValidateParams(validator: (args: any[]) => string[]) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const errors = validator(args);
      Validator.throwIfInvalid(errors);
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}