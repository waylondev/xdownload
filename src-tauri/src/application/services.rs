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
    
    /// 解析URL获取视频信息（单一职责原则）
/// 解析URL
    pub async fn parse_url(&self, url: &str) -> Result<ParseResult, String> {
        info!("应用层: 开始解析URL: {}", url);
        let result = self.url_parser.parse_url(url).await;
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
    pub async fn create_download_task(&self, url: &str) -> Result<String, String> {
        info!("应用层: 创建下载任务, URL: {}", url);
        let task_id = format!(
            "task_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        
        let task = DownloadTask::new(task_id.clone(), url.to_string());
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
    
    /// 开始下载视频（开闭原则 - 易于扩展）
    pub async fn start_download(
        &self, 
        task_id: &str, 
        format_id: Option<&str>
    ) -> Result<(), String> {
        // 获取任务
        let mut task = self.task_repository.find_by_id(task_id).await
            .ok_or_else(|| "Task not found".to_string())?;
        
        // 更新任务状态
        task.status = DownloadStatus::Downloading;
        self.task_repository.update(&task).await?;
        
        // 启动异步下载
        let task_repository_clone = Arc::clone(&self.task_repository);
        let content_downloader_clone = Arc::clone(&self.content_downloader);
        let task_id_clone = task_id.to_string();
        let url_clone = task.url.clone();
        let format_id_clone = format_id.map(|s| s.to_string());
        
        tokio::spawn(async move {
            // 在闭包内部创建新的变量引用
            let task_repository = Arc::clone(&task_repository_clone);
            let task_id = task_id_clone.clone();
            
            let progress_callback = Box::new(move |progress: f32, speed: String| {
                let task_repository = Arc::clone(&task_repository_clone);
                let task_id = task_id_clone.clone();
                
                tokio::spawn(async move {
                    if let Some(mut task) = task_repository.find_by_id(&task_id).await {
                        task.update_progress(progress, speed);
                        let _ = task_repository.update(&task).await;
                    }
                });
            });
            
            match content_downloader_clone.download_content(
                &url_clone, 
                format_id_clone.as_deref(),
                progress_callback
            ).await {
                Ok(_) => {
                    if let Some(mut task) = task_repository.find_by_id(&task_id).await {
                        task.mark_completed();
                        let _ = task_repository.update(&task).await;
                    }
                }
                Err(e) => {
                    if let Some(mut task) = task_repository.find_by_id(&task_id).await {
                        task.mark_failed(e);
                        let _ = task_repository.update(&task).await;
                    }
                }
            }
        });
        
        Ok(())
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