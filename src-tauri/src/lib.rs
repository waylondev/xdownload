// 应用入口点
mod application;
mod presentation;

use application::services::DownloadService;
use presentation::commands::execute_command;
use tauri::Manager;

/// 创建下载服务实例
pub fn create_download_service(app_handle: tauri::AppHandle) -> DownloadService {
    DownloadService::new(app_handle)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 创建服务实例
            let download_service = create_download_service(app.handle().clone());
            
            // 将服务注入到状态管理
            app.manage(std::sync::Mutex::new(download_service));
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            execute_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}