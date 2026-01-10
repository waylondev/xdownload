// 自定义错误类型
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

// 错误处理中间件
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: Set<(error: Error) => void> = new Set();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 注册错误处理回调
  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  // 处理错误
  handleError(error: Error): void {
    console.error("应用程序错误:", error);
    
    // 通知所有注册的回调
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error("错误处理回调出错:", callbackError);
      }
    });
  }

  // 创建包装函数，自动处理异步错误
  wrapAsync<T extends any[]>(fn: (...args: T) => Promise<any>) {
    return async (...args: T): Promise<any> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error as Error);
        throw error;
      }
    };
  }

  // 创建包装函数，自动处理同步错误
  wrapSync<T extends any[]>(fn: (...args: T) => any) {
    return (...args: T): any => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error as Error);
        throw error;
      }
    };
  }
}

// 全局错误处理实例
export const errorHandler = ErrorHandler.getInstance();

// 常用的应用错误类型
export const Errors = {
  NETWORK_ERROR: new AppError("网络连接错误", "NETWORK_ERROR", 503),
  VALIDATION_ERROR: new AppError("数据验证失败", "VALIDATION_ERROR", 400),
  NOT_FOUND: new AppError("资源未找到", "NOT_FOUND", 404),
  UNAUTHORIZED: new AppError("未授权访问", "UNAUTHORIZED", 401),
  DOWNLOAD_FAILED: new AppError("下载失败", "DOWNLOAD_FAILED", 500)
};