// 平台模块 - 模型定义
use serde::{Deserialize, Serialize};

/// 平台模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Platform {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub description: String,
    pub supported_types: Vec<String>,
    pub api_endpoint: Option<String>,
    pub is_enabled: bool,
    pub priority: u32,
    pub max_concurrent_downloads: Option<u32>,
    pub requires_auth: bool,
}

impl Platform {
    /// 创建新平台
    pub fn new(
        id: String,
        name: String,
        icon: String,
        description: String,
        supported_types: Vec<String>,
        api_endpoint: Option<String>,
        is_enabled: bool,
        priority: u32,
        max_concurrent_downloads: Option<u32>,
        requires_auth: bool,
    ) -> Self {
        Self {
            id,
            name,
            icon,
            description,
            supported_types,
            api_endpoint,
            is_enabled,
            priority,
            max_concurrent_downloads,
            requires_auth,
        }
    }

    /// 启用平台
    pub fn enable(&mut self) {
        self.is_enabled = true;
    }

    /// 禁用平台
    pub fn disable(&mut self) {
        self.is_enabled = false;
    }

    /// 检查是否支持指定类型
    pub fn supports_type(&self, file_type: &str) -> bool {
        self.supported_types.contains(&file_type.to_string())
    }
}
