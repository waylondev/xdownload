// 表示层 - Tauri命令接口
use serde::Deserialize;
use tokio::sync::Mutex;
use tauri::State;

use crate::application::services::DownloadService;
use crate::domain::entities::{ParseResult, DownloadTask};

/// 解析URL请求
#[derive(Debug, Deserialize)]
pub struct ParseUrlRequest {
    pub url: String,
}

/// 开始下载请求
#[derive(Debug, Deserialize)]
pub struct StartDownloadRequest {
    pub url: String,
    pub format_id: Option<String>,
}

/// 获取下载进度请求
#[derive(Debug, Deserialize)]
pub struct GetDownloadProgressRequest {
    pub task_id: String,
}

/// 解析URL命令
#[tauri::command]
pub async fn parse_url(
    download_service: State<'_, Mutex<DownloadService>>,
    request: ParseUrlRequest,
) -> Result<ParseResult, String> {
    let service = download_service.lock().await;
    service.parse_url(&request.url).await
}

/// 开始下载命令
#[tauri::command]
pub async fn start_download(
    download_service: State<'_, Mutex<DownloadService>>,
    request: StartDownloadRequest,
) -> Result<String, String> {
    let service = download_service.lock().await;
    let task_id = service.create_download_task(&request.url).await?;
    service.start_download(&task_id, request.format_id.as_deref()).await?;
    Ok(task_id)
}

/// 获取下载进度命令
#[tauri::command]
pub async fn get_download_progress(
    download_service: State<'_, Mutex<DownloadService>>,
    request: GetDownloadProgressRequest,
) -> Option<DownloadTask> {
    let service = download_service.lock().await;
    service.get_download_progress(&request.task_id).await
}