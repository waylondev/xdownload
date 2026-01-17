// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 配置日志系统
    env_logger::init();
    
    xdownload_lib::run()
}
