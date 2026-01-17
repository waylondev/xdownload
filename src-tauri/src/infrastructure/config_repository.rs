// 基础设施层 - 配置存储实现
use std::fs;
use async_trait::async_trait;
use serde_json;

use crate::domain::{
    entities::AppConfig,
    repository::ConfigRepository
};

/// 文件配置存储实现
pub struct FileConfigRepository;

impl FileConfigRepository {
    pub fn new() -> Self {
        Self
    }
}

impl Default for FileConfigRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ConfigRepository for FileConfigRepository {
    async fn load_config(&self) -> Result<AppConfig, String> {
        // 简单文件配置 - 使用项目根目录下的 config.json
        let config_path = "config.json";
        
        if !std::path::Path::new(config_path).exists() {
            // 配置文件不存在，返回默认配置
            return Ok(AppConfig::default());
        }
        
        let content = fs::read_to_string(config_path)
            .map_err(|e| format!("读取配置文件失败: {}", e))?;
        
        let config: AppConfig = serde_json::from_str(&content)
            .map_err(|e| format!("解析配置文件失败: {}", e))?;
        
        Ok(config)
    }
    
    async fn save_config(&self, config: &AppConfig) -> Result<(), String> {
        // 简单文件配置 - 保存到项目根目录下的 config.json
        let config_path = "config.json";
        
        let content = serde_json::to_string_pretty(config)
            .map_err(|e| format!("序列化配置失败: {}", e))?;
        
        fs::write(config_path, content)
            .map_err(|e| format!("写入配置文件失败: {}", e))?;
        
        Ok(())
    }
}