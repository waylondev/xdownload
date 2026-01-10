// 统一错误处理服务 - 集中管理应用中的错误
import { ErrorInfo } from 'react';
import { AppError } from '../types/unified-interface';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high';
  category: 'ui' | 'api' | 'network' | 'validation' | 'unknown';
  context?: Record<string, any>;
}

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteReporting: boolean;
  remoteEndpoint?: string;
  maxErrorsPerMinute: number;
  ignoredErrors: string[];
}

// 错误处理服务类
export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private config: ErrorHandlerConfig;
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  private errorQueue: ErrorReport[] = [];

  private constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteReporting: false,
      maxErrorsPerMinute: 10,
      ignoredErrors: [],
      ...config
    };
  }

  public static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService(config);
    }
    return ErrorHandlingService.instance;
  }

  // 处理React组件错误
  public handleComponentError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this.determineSeverity(error),
      category: 'ui',
      context
    };

    this.processError(errorReport);
  }

  // 处理API错误
  public handleApiError(error: Error, endpoint: string, method: string, statusCode?: number): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
      category: 'api',
      context: {
        endpoint,
        method,
        statusCode
      }
    };

    this.processError(errorReport);
  }

  // 处理网络错误
  public handleNetworkError(error: Error, url: string, method: string): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: 'high',
      category: 'network',
      context: {
        targetUrl: url,
        method
      }
    };

    this.processError(errorReport);
  }

  // 处理验证错误
  public handleValidationError(error: Error, field?: string, value?: any): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: 'low',
      category: 'validation',
      context: {
        field,
        value
      }
    };

    this.processError(errorReport);
  }

  // 处理通用错误
  public handleGenericError(error: Error, category: ErrorReport['category'] = 'unknown', context?: Record<string, any>): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this.determineSeverity(error),
      category,
      context
    };

    this.processError(errorReport);
  }

  // 处理应用错误（AppError类型）
  public handleError(appError: AppError): void {
    const errorReport: ErrorReport = {
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this.determineSeverityFromType(appError.type),
      category: this.mapErrorTypeToCategory(appError.type),
      context: {
        errorType: appError.type,
        errorCode: appError.code,
        details: appError.details
      }
    };

    this.processError(errorReport);
  }

  // 处理错误报告
  private processError(errorReport: ErrorReport): void {
    // 检查是否应该忽略此错误
    if (this.shouldIgnoreError(errorReport)) {
      return;
    }

    // 检查错误频率限制
    if (!this.shouldProcessError()) {
      console.warn('错误频率过高，跳过处理:', errorReport.message);
      return;
    }

    // 控制台日志
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorReport);
    }

    // 远程报告
    if (this.config.enableRemoteReporting && this.config.remoteEndpoint) {
      this.reportToRemote(errorReport);
    }

    // 添加到错误队列
    this.errorQueue.push(errorReport);
    
    // 限制队列大小
    if (this.errorQueue.length > 100) {
      this.errorQueue.shift();
    }

    // 更新错误计数
    this.updateErrorCount();
  }

  // 确定错误严重性
  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.indexOf('network') !== -1 || message.indexOf('timeout') !== -1 || message.indexOf('connection') !== -1) {
      return 'high';
    }
    
    if (message.indexOf('validation') !== -1 || message.indexOf('invalid') !== -1) {
      return 'low';
    }
    
    return 'medium';
  }

  // 根据错误类型确定严重性
  private determineSeverityFromType(errorType: string): ErrorReport['severity'] {
    const severityMap: Record<string, ErrorReport['severity']> = {
      'network': 'high',
      'api': 'medium',
      'ui': 'low',
      'validation': 'low',
      'unknown': 'medium'
    };
    
    return severityMap[errorType] || 'medium';
  }

  // 映射错误类型到错误类别
  private mapErrorTypeToCategory(errorType: string): ErrorReport['category'] {
    const categoryMap: Record<string, ErrorReport['category']> = {
      'network': 'network',
      'api': 'api',
      'ui': 'ui',
      'validation': 'validation'
    };
    
    return categoryMap[errorType] || 'unknown';
  }

  // 检查是否应该忽略错误
  private shouldIgnoreError(errorReport: ErrorReport): boolean {
    return this.config.ignoredErrors.some(ignored => 
      errorReport.message.indexOf(ignored) !== -1
    );
  }

  // 检查是否应该处理错误（频率限制）
  private shouldProcessError(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    if (this.lastErrorTime < oneMinuteAgo) {
      this.errorCount = 0;
      this.lastErrorTime = now;
    }
    
    return this.errorCount < this.config.maxErrorsPerMinute;
  }

  // 更新错误计数
  private updateErrorCount(): void {
    this.errorCount++;
    this.lastErrorTime = Date.now();
  }

  // 控制台日志
  private logToConsole(errorReport: ErrorReport): void {
    const { severity, category, message, timestamp } = errorReport;
    
    const logMessage = `[${timestamp}] [${severity.toUpperCase()}] [${category}] ${message}`;
    
    switch (severity) {
      case 'high':
        console.error(logMessage, errorReport);
        break;
      case 'medium':
        console.warn(logMessage, errorReport);
        break;
      case 'low':
        console.info(logMessage, errorReport);
        break;
    }
  }

  // 远程报告
  private async reportToRemote(errorReport: ErrorReport): Promise<void> {
    try {
      if (!this.config.remoteEndpoint) return;
      
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
      
      if (!response.ok) {
        console.warn('远程错误报告失败:', response.status);
      }
    } catch (error) {
      console.warn('远程错误报告异常:', error);
    }
  }

  // 获取错误统计
  public getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    this.errorQueue.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });
    
    return {
      totalErrors: this.errorQueue.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: [...this.errorQueue].reverse().slice(0, 10)
    };
  }

  // 清空错误队列
  public clearErrors(): void {
    this.errorQueue = [];
    this.errorCount = 0;
  }

  // 更新配置
  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建全局错误处理服务实例
export const errorHandlingService = ErrorHandlingService.getInstance({
  enableConsoleLogging: true,
  enableRemoteReporting: false,
  maxErrorsPerMinute: 10,
  ignoredErrors: ['ResizeObserver loop limit exceeded']
});

// React错误边界使用的错误处理钩子
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>) => {
    errorHandlingService.handleComponentError(error, errorInfo, context);
  };

  const handleApiError = (error: Error, endpoint: string, method: string, statusCode?: number) => {
    errorHandlingService.handleApiError(error, endpoint, method, statusCode);
  };

  const handleNetworkError = (error: Error, url: string, method: string) => {
    errorHandlingService.handleNetworkError(error, url, method);
  };

  const handleValidationError = (error: Error, field?: string, value?: any) => {
    errorHandlingService.handleValidationError(error, field, value);
  };

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    errorHandlingService
  };
}