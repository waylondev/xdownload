// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Mutex;

mod modules;

// 导入简化的垂直模块API
use modules::download::api::{
    cancel_download, create_download_service, get_download_task, get_download_tasks,
    pause_download, resume_download, start_download,
};
use modules::platform::api::{create_platform_service, get_platforms};
use modules::search::api::{create_search_service, get_search_suggestions, search};
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 创建服务实例
    let platform_service = create_platform_service();
    let download_service = create_download_service();
    let search_service = create_search_service();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(platform_service))
        .manage(Mutex::new(download_service))
        .manage(Mutex::new(search_service))
        .invoke_handler(tauri::generate_handler!(
            greet,
            get_platforms,
            search,
            get_search_suggestions,
            start_download,
            get_download_tasks,
            get_download_task,
            cancel_download,
            pause_download,
            resume_download
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
