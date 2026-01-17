// 应用层 - 业务逻辑服务（依赖领域层接口）
use std::sync::Arc;
use log::{info, warn, error, debug};

use crate::domain::{
    entities::{AppConfig, DownloadTask, BatchDownloadTask, DownloadStatus, ParseResult},
    repository::{ConfigRepository, DownloadTaskRepository, BatchDownloadTaskRepository, UrlParser, ContentDownloader}
};

/// 下载服务（单一职责原则）
pub struct DownloadService {
    config_repository: Arc<dyn ConfigRepository>,
    task_repository: Arc<dyn DownloadTaskRepository>,
    batch_task_repository: Arc<dyn BatchDownloadTaskRepository>,
    url_parser: Arc<dyn UrlParser>,
    content_downloader: Arc<dyn ContentDownloader>,
}

impl DownloadService {
    pub fn new(
        config_repository: Arc<dyn ConfigRepository>,
        task_repository: Arc<dyn DownloadTaskRepository>,
        batch_task_repository: Arc<dyn BatchDownloadTaskRepository>,
        url_parser: Arc<dyn UrlParser>,
        content_downloader: Arc<dyn ContentDownloader>,
    ) -> Self {
        Self {
            config_repository,
            task_repository,
            batch_task_repository,
            url_parser,
            content_downloader,
        }
    }
    
    /// 获取应用配置
    pub async fn get_config(&self) -> Result<AppConfig, String> {
        info!("应用层: 获取应用配置");
        let config = self.config_repository.load_config().await?;
        info!("应用层: 配置加载成功, yt-dlp路径: {}, 下载路径: {}", 
              config.yt_dlp_path, config.download_path);
        Ok(config)
    }

    /// 保存应用配置
    pub async fn save_config(&self, config: &AppConfig) -> Result<(), String> {
        info!("应用层: 保存应用配置");
        self.config_repository.save_config(config).await?;
        info!("应用层: 配置保存成功");
        Ok(())
    }

    /// 解析URL获取视频信息（单一职责原则）
    pub async fn parse_url(&self, url: &str) -> Result<ParseResult, String> {
        info!("应用层: 开始解析URL: {}", url);
        
        // 获取配置中的yt-dlp路径
        let config = self.config_repository.load_config().await?;
        
        let result = self.url_parser.parse_url(url, &config.yt_dlp_path).await;
        match &result {
            Ok(parse_result) => {
                info!("应用层: URL解析成功, 标题: {}, 格式数: {}", 
                      parse_result.title, parse_result.formats.len());
            }
            Err(e) => {
                error!("应用层: URL解析失败: {}", e);
            }
        }
        result
    }
    
    /// 创建下载任务
    pub async fn create_download_task(&self, url: &str, format_id: &str) -> Result<String, String> {
        info!("应用层: 创建下载任务, URL: {}, 格式: {}", url, format_id);
        let task_id = format!(
            "task_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        
        let task = DownloadTask::new(task_id.clone(), url.to_string(), format_id.to_string());
        let result = self.task_repository.save(&task).await
            .map(|_| {
                info!("应用层: 下载任务创建成功, 任务ID: {}", task_id);
                task_id.clone()
            })
            .map_err(|e| {
                error!("应用层: 下载任务创建失败: {}", e);
                format!("Failed to create download task: {}", e)
            });
        result
    }

    /// 创建批量下载任务
    pub async fn create_batch_download_task(&self, url: &str, format_ids: Vec<String>) -> Result<String, String> {
        info!("应用层: 创建批量下载任务, URL: {}, 格式数: {}", url, format_ids.len());
        
        let batch_id = format!(
            "batch_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        
        // 创建批量任务
        let batch_task = BatchDownloadTask {
            id: batch_id.clone(),
            url: url.to_string(),
            title: None,
            thumbnail: None,
            format_ids: format_ids.clone(),
            tasks: Vec::new(),
            status: DownloadStatus::Pending,
            progress: 0.0,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };
        
        let result = self.batch_task_repository.save(&batch_task).await
            .map(|_| {
                info!("应用层: 批量下载任务创建成功, 批量ID: {}", batch_id);
                batch_id.clone()
            })
            .map_err(|e| {
                error!("应用层: 批量下载任务创建失败: {}", e);
                format!("Failed to create batch download task: {}", e)
            });
        result
    }

    /// 开始下载
    pub async fn start_download(
        &self,
        url: &str,
        format_id: &str
    ) -> Result<String, String> {
        info!("应用层: 开始下载, URL: {}, 格式: {}", url, format_id);
        
        // 获取配置
        let config = self.config_repository.load_config().await?;
        
        // 创建下载任务
        let task_id = self.create_download_task(url, format_id).await?;
        
        // 启动下载
        let downloader = Arc::clone(&self.content_downloader);
        let task_repo = Arc::clone(&self.task_repository);
        let config_clone = config.clone();
        
        tokio::spawn(async move {
            let progress_callback = Box::new(move |progress: f32, speed: String| {
                // 更新任务进度
                // 这里需要实现进度更新逻辑
            });
            
            match downloader.download_content(url, format_id, &config_clone.yt_dlp_path, &config_clone.download_path, progress_callback).await {
                Ok(_) => {
                    // 下载成功
                    info!("下载任务完成: {}", task_id);
                }
                Err(e) => {
                    // 下载失败
                    error!("下载任务失败: {}, 错误: {}", task_id, e);
                }
            }
        });
        
        Ok(task_id)
    }

    /// 开始批量下载
    pub async fn start_batch_download(
        &self,
        url: &str,
        format_ids: Vec<String>
    ) -> Result<String, String> {
        info!("应用层: 开始批量下载, URL: {}, 格式数: {}", url, format_ids.len());
        
        // 获取配置
        let config = self.config_repository.load_config().await?;
        
        // 创建批量下载任务
        let batch_id = self.create_batch_download_task(url, format_ids.clone()).await?;
        
        // 启动批量下载
        for format_id in format_ids {
            let downloader = Arc::clone(&self.content_downloader);
            let task_repo = Arc::clone(&self.task_repository);
            let batch_repo = Arc::clone(&self.batch_task_repository);
            let batch_id_clone = batch_id.clone();
            let config_clone = config.clone();
            
            tokio::spawn(async move {
                // 创建单个任务
                let task_id = format!("task_{}_{}", batch_id_clone, format_id);
                let task = DownloadTask::new(task_id.clone(), url.to_string(), format_id.clone());
                
                if let Err(e) = task_repo.save(&task).await {
                    error!("批量下载任务创建失败: {}", e);
                    return;
                }
                
                let progress_callback = Box::new(move |progress: f32, speed: String| {
                    // 更新任务进度
                    // 这里需要实现进度更新逻辑
                });
                
                match downloader.download_content(url, &format_id, &config_clone.yt_dlp_path, &config_clone.download_path, progress_callback).await {
                    Ok(_) => {
                        info!("批量下载任务完成: {}/{}", batch_id_clone, format_id);
                    }
                    Err(e) => {
                        error!("批量下载任务失败: {}/{}, 错误: {}", batch_id_clone, format_id, e);
                    }
                }
            });
        }
        
        Ok(batch_id)
    }
    
    /// 获取下载进度
    pub async fn get_download_progress(&self, task_id: &str) -> Option<DownloadTask> {
        self.task_repository.find_by_id(task_id).await
    }
}

/// 进度追踪器服务（接口隔离原则）
pub struct ProgressTracker {
    task_repository: Arc<dyn DownloadTaskRepository>,
}

impl ProgressTracker {
    pub fn new(task_repository: Arc<dyn DownloadTaskRepository>) -> Self {
        Self { task_repository }
    }
    
    pub async fn get_progress(&self, task_id: &str) -> Option<DownloadTask> {
        self.task_repository.find_by_id(task_id).await
    }
}