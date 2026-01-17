// 领域层 - 实体定义
use serde::{Deserialize, Serialize};

/// 应用配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub yt_dlp_path: String,
    pub download_path: String,
    pub max_concurrent_downloads: usize,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            yt_dlp_path: "../bin/yt-dlp.exe".to_string(),
            download_path: "../downloads".to_string(),
            max_concurrent_downloads: 3,
        }
    }
}

/// 视频格式
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoFormat {
    pub format_id: String,
    pub ext: String,
    pub resolution: Option<String>,
    pub filesize: Option<u64>,
    pub format_note: Option<String>,
    pub fps: Option<f32>,
    pub vcodec: Option<String>,
    pub acodec: Option<String>,
}

/// 解析结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub title: String,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub formats: Vec<VideoFormat>,
}

/// 下载状态
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DownloadStatus {
    Pending,
    Downloading,
    Completed,
    Failed,
    Cancelled,
}

/// 下载任务
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadTask {
    pub id: String,
    pub url: String,
    pub title: Option<String>,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub format_id: String,
    pub status: DownloadStatus,
    pub progress: f32,
    pub speed: String,
    pub file_path: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl DownloadTask {
    pub fn new(id: String, url: String, format_id: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        
        Self {
            id,
            url,
            title: None,
            duration: None,
            thumbnail: None,
            format_id,
            status: DownloadStatus::Pending,
            progress: 0.0,
            speed: "0 KB/s".to_string(),
            file_path: None,
            created_at: now,
            updated_at: now,
        }
    }
}

/// 批量下载任务组
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchDownloadTask {
    pub id: String,
    pub url: String,
    pub title: Option<String>,
    pub thumbnail: Option<String>,
    pub format_ids: Vec<String>,
    pub tasks: Vec<DownloadTask>,
    pub status: DownloadStatus,
    pub progress: f32,
    pub created_at: u64,
}