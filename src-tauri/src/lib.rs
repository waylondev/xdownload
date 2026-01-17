// Application entry point - Following Clean Architecture
mod command_service;

use command_service::CommandService;
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let command_service = CommandService::new(app.handle().clone());
            app.manage(Mutex::new(command_service));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![command_service::execute_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}