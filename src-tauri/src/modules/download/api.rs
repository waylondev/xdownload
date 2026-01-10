// 下载模块 - API层，实现IPC命令
use serde::Deserialize;
use std::sync::Mutex;
use tauri::State;

use super::models::DownloadTask;
use super::services::DownloadService;

/// 开始下载请求
#[derive(Debug, Deserialize)]
pub struct StartDownloadRequest {
    pub url: String,
    pub filename: String,
    pub download_type: String,
    pub platform: String,
}

/// 创建下载服务实例
pub fn create_download_service() -> DownloadService {
    DownloadService::new()
}

/// 开始下载
#[tauri::command]
pub async fn start_download(
    download_service: State<'_, Mutex<DownloadService>>,
    request: StartDownloadRequest,
) -> Result<String, String> {
    let mut service = download_service.lock().map_err(|e| e.to_string())?;
    let task_id = service.start_download(
        &request.url,
        &request.filename,
        &request.download_type,
        &request.platform,
    );
    Ok(task_id)
}

/// 获取所有下载任务
#[tauri::command]
pub async fn get_download_tasks(
    download_service: State<'_, Mutex<DownloadService>>,
) -> Result<Vec<DownloadTask>, String> {
    let service = download_service.lock().map_err(|e| e.to_string())?;
    Ok(service.get_all_tasks())
}

/// 获取单个下载任务
#[tauri::command]
pub async fn get_download_task(
    download_service: State<'_, Mutex<DownloadService>>,
    task_id: String,
) -> Result<Option<DownloadTask>, String> {
    let service = download_service.lock().map_err(|e| e.to_string())?;
    Ok(service.get_task_by_id(&task_id))
}

/// 取消下载
#[tauri::command]
pub async fn cancel_download(
    download_service: State<'_, Mutex<DownloadService>>,
    task_id: String,
) -> Result<(), String> {
    let mut service = download_service.lock().map_err(|e| e.to_string())?;
    service.cancel_download(&task_id)
}

/// 暂停下载
#[tauri::command]
pub async fn pause_download(
    download_service: State<'_, Mutex<DownloadService>>,
    task_id: String,
) -> Result<(), String> {
    let mut service = download_service.lock().map_err(|e| e.to_string())?;
    service.pause_download(&task_id)
}

/// 恢复下载
#[tauri::command]
pub async fn resume_download(
    download_service: State<'_, Mutex<DownloadService>>,
    task_id: String,
) -> Result<(), String> {
    let mut service = download_service.lock().map_err(|e| e.to_string())?;
    service.resume_download(&task_id)
}
