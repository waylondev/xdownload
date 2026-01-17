// 应用层 - 业务逻辑服务（依赖领域层接口）
use std::sync::Arc;

use crate::domain::{
    entities::{AppConfig, DownloadTask, ParseResult},
    repository::{ConfigRepository, DownloadTaskRepository, UrlParser, ContentDownloader}
};

/// 下载服务
pub struct DownloadService {
    config_repository: Arc<dyn ConfigRepository>,
    task_repository: Arc<dyn DownloadTaskRepository>,
    url_parser: Arc<dyn UrlParser>,
    content_downloader: Arc<dyn ContentDownloader>,
}

impl DownloadService {
    pub fn new(
        config_repository: Arc<dyn ConfigRepository>,
        task_repository: Arc<dyn DownloadTaskRepository>,
        url_parser: Arc<dyn UrlParser>,
        content_downloader: Arc<dyn ContentDownloader>,
    ) -> Self {
        Self {
            config_repository,
            task_repository,
            url_parser,
            content_downloader,
        }
    }
    
    /// 获取应用配置
    pub async fn get_config(&self) -> Result<AppConfig, String> {
        self.config_repository.load_config().await
    }

    /// 保存应用配置
    pub async fn save_config(&self, config: &AppConfig) -> Result<(), String> {
        self.config_repository.save_config(config).await
    }

    /// 解析URL获取视频信息
    pub async fn parse_url(&self, url: &str) -> Result<ParseResult, String> {
        let config = self.config_repository.load_config().await?;
        self.url_parser.parse_url(url, &config.yt_dlp_path).await
    }
    
    /// 开始下载
    pub async fn start_download(
        &self,
        url: &str,
        format_id: &str
    ) -> Result<String, String> {
        // 获取配置
        let config = self.config_repository.load_config().await?;
        
        // 生成任务ID
        let task_id = format!(
            "task_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        
        // 克隆字符串以避免生命周期问题
        let url_clone = url.to_string();
        let format_id_clone = format_id.to_string();
        
        // 启动异步下载
        let downloader = Arc::clone(&self.content_downloader);
        let config_clone = config.clone();
        
        tokio::spawn(async move {
            let progress_callback = Box::new(|_progress: f32, _speed: String| {
                // 简单的进度回调
            });
            
            let _ = downloader.download_content(&url_clone, &format_id_clone, &config_clone.yt_dlp_path, &config_clone.download_path, progress_callback).await;
        });
        
        Ok(task_id)
    }
    
    /// 获取下载进度
    pub async fn get_download_progress(&self, task_id: &str) -> Option<DownloadTask> {
        self.task_repository.find_by_id(task_id).await.ok().flatten()
    }
}

/// 进度追踪器服务
pub struct ProgressTracker {
    task_repository: Arc<dyn DownloadTaskRepository>,
}

impl ProgressTracker {
    pub fn new(task_repository: Arc<dyn DownloadTaskRepository>) -> Self {
        Self { task_repository }
    }
    
    pub async fn get_progress(&self, task_id: &str) -> Option<DownloadTask> {
        self.task_repository.find_by_id(task_id).await.ok().flatten()
    }
}