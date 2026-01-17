// 领域层 - 仓储接口定义（依赖倒置原则）
use async_trait::async_trait;
use super::entities::{DownloadTask, ParseResult};

/// 下载任务仓储接口
#[async_trait]
pub trait DownloadTaskRepository: Send + Sync {
    async fn save(&self, task: &DownloadTask) -> Result<(), String>;
    async fn find_by_id(&self, task_id: &str) -> Option<DownloadTask>;
    async fn update(&self, task: &DownloadTask) -> Result<(), String>;
}

/// URL解析器接口
#[async_trait]
pub trait UrlParser: Send + Sync {
    async fn parse_url(&self, url: &str) -> Result<ParseResult, String>;
}

/// 内容下载器接口
#[async_trait]
pub trait ContentDownloader: Send + Sync {
    async fn download_content(
        &self, 
        url: &str, 
        format_id: Option<&str>,
        progress_callback: Box<dyn Fn(f32, String) + Send + Sync>
    ) -> Result<(), String>;
}