// 领域层 - 核心实体定义
use serde::{Deserialize, Serialize};

/// 下载任务状态枚举
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum DownloadStatus {
    Pending,
    Parsing,
    Ready,
    Downloading,
    Completed,
    Failed,
}

/// 视频格式信息实体
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoFormat {
    pub format_id: String,
    pub ext: String,
    pub resolution: Option<String>,
    pub filesize: Option<u64>,
    pub format_note: Option<String>,
}

/// 下载任务实体
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadTask {
    pub id: String,
    pub url: String,
    pub title: Option<String>,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub formats: Vec<VideoFormat>,
    pub status: DownloadStatus,
    pub progress: f32,
    pub speed: String,
    pub error: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// URL解析结果实体
#[derive(Debug, Serialize, Deserialize)]
pub struct ParseResult {
    pub title: String,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub formats: Vec<VideoFormat>,
}

// 实体方法实现
impl DownloadTask {
    pub fn new(id: String, url: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        
        Self {
            id,
            url,
            title: None,
            duration: None,
            thumbnail: None,
            formats: Vec::new(),
            status: DownloadStatus::Pending,
            progress: 0.0,
            speed: "0 KB/s".to_string(),
            error: None,
            created_at: now,
            updated_at: now,
        }
    }
    
    pub fn update_progress(&mut self, progress: f32, speed: String) {
        self.progress = progress;
        self.speed = speed;
        self.status = DownloadStatus::Downloading;
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
    }
    
    pub fn mark_completed(&mut self) {
        self.status = DownloadStatus::Completed;
        self.progress = 100.0;
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
    }
    
    pub fn mark_failed(&mut self, error: String) {
        self.status = DownloadStatus::Failed;
        self.error = Some(error);
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
    }
}