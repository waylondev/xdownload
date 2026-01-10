// 搜索模块 - API层，实现IPC命令
use serde::Deserialize;
use std::sync::Mutex;
use tauri::State;

use super::models::SearchResponse;
use super::services::SearchService;

/// 搜索请求参数
#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub file_type: String,
    pub platform: String,
    pub page: u32,
    pub page_size: u32,
}

/// 创建搜索服务实例
pub fn create_search_service() -> SearchService {
    SearchService::new()
}

/// 执行搜索
#[tauri::command]
pub async fn search(
    search_service: State<'_, Mutex<SearchService>>,
    request: SearchRequest,
) -> Result<SearchResponse, String> {
    let service = search_service.lock().map_err(|e| e.to_string())?;
    let response = service.search(
        &request.query,
        &request.file_type,
        &request.platform,
        request.page,
        request.page_size,
    );
    Ok(response)
}

/// 获取搜索建议
#[tauri::command]
pub async fn get_search_suggestions(
    search_service: State<'_, Mutex<SearchService>>,
    query: String,
    platform: String,
) -> Result<Vec<String>, String> {
    let service = search_service.lock().map_err(|e| e.to_string())?;
    let suggestions = service.get_search_suggestions(&query, &platform);
    Ok(suggestions.into_iter().map(|s| s.text).collect())
}
