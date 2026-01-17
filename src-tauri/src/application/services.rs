// 应用层 - 业务逻辑服务（依赖领域层接口）
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::domain::{
    entities::{DownloadTask, DownloadStatus, ParseResult},
    repository::{DownloadTaskRepository, UrlParser, ContentDownloader}
};

/// 下载服务 - 应用层核心服务
pub struct DownloadService {
    task_repository: Arc<dyn DownloadTaskRepository>,
    url_parser: Arc<dyn UrlParser>,
    content_downloader: Arc<dyn ContentDownloader>,
}

impl DownloadService {
    pub fn new(
        task_repository: Arc<dyn DownloadTaskRepository>,
        url_parser: Arc<dyn UrlParser>,
        content_downloader: Arc<dyn ContentDownloader>,
    ) -> Self {
        Self {
            task_repository,
            url_parser,
            content_downloader,
        }
    }
    
    /// 解析URL获取视频信息（单一职责原则）
    pub async fn parse_url(&self, url: &str) -> Result<ParseResult, String> {
        self.url_parser.parse_url(url).await
    }
    
    /// 创建下载任务
    pub async fn create_download_task(&self, url: &str) -> Result<String, String> {
        let task_id = format!(
            "task_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        
        let task = DownloadTask::new(task_id.clone(), url.to_string());
        self.task_repository.save(&task).await?;
        
        Ok(task_id)
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
        let task_repository = Arc::clone(&self.task_repository);
        let content_downloader = Arc::clone(&self.content_downloader);
        let task_id_clone = task_id.to_string();
        let url_clone = task.url.clone();
        let format_id_clone = format_id.map(|s| s.to_string());
        
        tokio::spawn(async move {
            let progress_callback = Box::new(move |progress: f32, speed: String| {
                let task_repository = Arc::clone(&task_repository);
                let task_id = task_id_clone.clone();
                
                tokio::spawn(async move {
                    if let Some(mut task) = task_repository.find_by_id(&task_id).await {
                        task.update_progress(progress, speed);
                        let _ = task_repository.update(&task).await;
                    }
                });
            });
            
            match content_downloader.download_content(
                &url_clone, 
                format_id_clone.as_deref(),
                progress_callback
            ).await {
                Ok(_) => {
                    if let Some(mut task) = task_repository.find_by_id(&task_id_clone).await {
                        task.mark_completed();
                        let _ = task_repository.update(&task).await;
                    }
                }
                Err(e) => {
                    if let Some(mut task) = task_repository.find_by_id(&task_id_clone).await {
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