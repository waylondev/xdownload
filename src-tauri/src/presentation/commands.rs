// 表示层 - Tauri命令接口
use serde::Deserialize;
use tokio::sync::Mutex;
use tauri::State;

use crate::application::services::DownloadService;
use crate::domain::entities::{AppConfig, ParseResult, DownloadTask};

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

/// 保存配置请求
#[derive(Debug, Deserialize)]
pub struct SaveConfigRequest {
    pub config: AppConfig,
}



/// 获取配置命令
#[tauri::command]
pub async fn get_config(
    download_service: State<'_, Mutex<DownloadService>>,
) -> Result<AppConfig, String> {
    let service = download_service.lock().await;
    service.get_config().await
}

/// 保存配置命令
#[tauri::command]
pub async fn save_config(
    download_service: State<'_, Mutex<DownloadService>>,
    request: SaveConfigRequest,
) -> Result<(), String> {
    let service = download_service.lock().await;
    service.save_config(&request.config).await
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
    let format_id = request.format_id.unwrap_or_else(|| "best".to_string());
    service.start_download(&request.url, &format_id).await
}



/// 获取下载进度命令
#[tauri::command]
pub async fn get_download_progress(
    download_service: State<'_, Mutex<DownloadService>>,
    request: GetDownloadProgressRequest,
) -> Result<Option<DownloadTask>, String> {
    let service = download_service.lock().await;
    Ok(service.get_download_progress(&request.task_id).await)
}