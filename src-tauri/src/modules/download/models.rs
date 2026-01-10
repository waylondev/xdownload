// 下载模块 - 模型定义
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// 下载状态枚举
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum DownloadStatus {
    Pending,
    Downloading,
    Completed,
    Failed,
    Cancelled,
    Paused,
}

/// 下载任务模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadTask {
    pub id: String,
    pub url: String,
    pub filename: String,
    pub download_type: String,
    pub platform: String,
    pub status: DownloadStatus,
    pub progress: f32,
    pub speed: String,
    pub size: Option<String>,
    pub downloaded: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl DownloadTask {
    /// 创建新下载任务
    pub fn new(
        id: String,
        url: String,
        filename: String,
        download_type: String,
        platform: String,
    ) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;

        Self {
            id,
            url,
            filename,
            download_type,
            platform,
            status: DownloadStatus::Pending,
            progress: 0.0,
            speed: "0 KB/s".to_string(),
            size: None,
            downloaded: None,
            created_at: now,
            updated_at: now,
        }
    }

    /// 更新下载进度
    pub fn update_progress(&mut self, progress: f32, speed: String) {
        self.progress = progress;
        self.speed = speed;
        self.status = DownloadStatus::Downloading;
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
    }

    /// 完成下载
    pub fn complete(&mut self) {
        self.progress = 100.0;
        self.status = DownloadStatus::Completed;
        self.speed = "0 KB/s".to_string();
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
    }

    /// 取消下载
    pub fn cancel(&mut self) {
        self.status = DownloadStatus::Cancelled;
        self.speed = "0 KB/s".to_string();
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
    }

    /// 暂停下载
    pub fn pause(&mut self) {
        self.status = DownloadStatus::Paused;
        self.speed = "0 KB/s".to_string();
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
    }

    /// 恢复下载
    pub fn resume(&mut self) {
        self.status = DownloadStatus::Downloading;
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
    }
}
