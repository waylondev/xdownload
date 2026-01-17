// 主入口文件 - 依赖注入和Tauri应用配置
use std::sync::Arc;
use tokio::sync::Mutex;

// 导入各层模块
pub mod domain;
pub mod application;
pub mod infrastructure;
pub mod presentation;

// 导入具体实现
use infrastructure::{
    config_repository::FileConfigRepository,
    repositories::InMemoryDownloadTaskRepository,
    yt_dlp::{YtDlpUrlParser, YtDlpContentDownloader}
};
use application::services::DownloadService;
use presentation::commands::{
    get_config, save_config, parse_url, start_download, get_download_progress
};

/// 创建下载服务实例（依赖注入）
pub fn create_download_service() -> DownloadService {
    // 创建基础设施层实例
    let config_repository = Arc::new(FileConfigRepository::new());
    let task_repository = Arc::new(InMemoryDownloadTaskRepository::new());
    let batch_task_repository = Arc::new(InMemoryDownloadTaskRepository::new()); // 暂时使用同一个实现
    let url_parser = Arc::new(YtDlpUrlParser::new());
    let content_downloader = Arc::new(YtDlpContentDownloader::new());
    
    // 创建应用层服务（依赖注入）
    DownloadService::new(
        config_repository,
        task_repository,
        batch_task_repository,
        url_parser,
        content_downloader
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 创建服务实例
    let download_service = create_download_service();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(download_service))
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            parse_url,
            start_download,
            get_download_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}