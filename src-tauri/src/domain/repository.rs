// 领域层 - 仓储接口定义（依赖倒置原则）
use async_trait::async_trait;

use crate::domain::entities::{AppConfig, DownloadTask, BatchDownloadTask, ParseResult};

/// 配置存储接口
#[async_trait]
pub trait ConfigRepository: Send + Sync {
    async fn load_config(&self) -> Result<AppConfig, String>;
    async fn save_config(&self, config: &AppConfig) -> Result<(), String>;
}

/// URL解析器接口
#[async_trait]
pub trait UrlParser: Send + Sync {
    async fn parse_url(&self, url: &str, yt_dlp_path: &str) -> Result<ParseResult, String>;
}

/// 内容下载器接口
#[async_trait]
pub trait ContentDownloader: Send + Sync {
    async fn download_content(
        &self, 
        url: &str, 
        format_id: &str,
        yt_dlp_path: &str,
        download_path: &str,
        progress_callback: Box<dyn Fn(f32, String) + Send + Sync>
    ) -> Result<(), String>;
}

/// 下载任务存储接口
#[async_trait]
pub trait DownloadTaskRepository: Send + Sync {
    async fn save(&self, task: &DownloadTask) -> Result<(), String>;
    async fn find_by_id(&self, task_id: &str) -> Result<Option<DownloadTask>, String>;
    async fn find_all(&self) -> Result<Vec<DownloadTask>, String>;
    async fn update(&self, task: &DownloadTask) -> Result<(), String>;
    async fn delete(&self, task_id: &str) -> Result<(), String>;
}

/// 批量下载任务存储接口
#[async_trait]
pub trait BatchDownloadTaskRepository: Send + Sync {
    async fn save(&self, batch_task: &BatchDownloadTask) -> Result<(), String>;
    async fn find_by_id(&self, batch_id: &str) -> Result<Option<BatchDownloadTask>, String>;
    async fn find_all(&self) -> Result<Vec<BatchDownloadTask>, String>;
    async fn update(&self, batch_task: &BatchDownloadTask) -> Result<(), String>;
    async fn delete(&self, batch_id: &str) -> Result<(), String>;
}