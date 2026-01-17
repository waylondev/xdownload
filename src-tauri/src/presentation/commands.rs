// 表示层 - Tauri命令接口
use serde::Deserialize;
use tokio::sync::Mutex;
use tauri::State;

use crate::application::services::DownloadService;

/// 执行命令请求
#[derive(Debug, Deserialize)]
pub struct ExecuteCommandRequest {
    pub command: String,
}

/// 执行命令命令
#[tauri::command]
pub async fn execute_command(
    download_service: State<'_, Mutex<DownloadService>>,
    request: ExecuteCommandRequest,
) -> Result<(), String> {
    let service = download_service.lock().await;
    service.execute_command(&request.command).await
}