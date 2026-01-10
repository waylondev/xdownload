// 平台模块API - 简化设计，只保留核心功能
use serde::Deserialize;
use std::sync::Mutex;
use tauri::State;

// 从models.rs导入平台实体定义
use super::models::Platform;
use super::services::PlatformService;

// 平台请求 - 支持参数过滤
#[derive(Debug, Deserialize)]
pub struct PlatformRequest {
    pub file_type: Option<String>,
    pub enabled_only: Option<bool>,
}

// 核心获取平台列表方法 - 支持参数过滤
#[tauri::command]
pub async fn get_platforms(
    platform_service: State<'_, Mutex<PlatformService>>,
    request: Option<PlatformRequest>,
) -> Result<Vec<Platform>, String> {
    let service = platform_service.lock().map_err(|e| e.to_string())?;

    // 调用服务层方法获取平台列表
    let platforms = service.get_platforms(
        request.as_ref().and_then(|r| r.file_type.as_deref()),
        request.as_ref().and_then(|r| r.enabled_only),
    );

    Ok(platforms)
}

// 创建平台服务实例
pub fn create_platform_service() -> PlatformService {
    PlatformService::new()
}
