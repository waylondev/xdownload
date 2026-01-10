// 平台模块 - 服务层
use super::models::Platform;
use serde::Deserialize;
use std::fs;
use std::path::Path;

// 平台配置结构
#[derive(Debug, Deserialize)]
struct PlatformConfig {
    platforms: Vec<Platform>,
}

/// 平台服务
#[derive(Debug, Default)]
pub struct PlatformService {
    pub platforms: Vec<Platform>,
}

impl PlatformService {
    /// 创建新的平台服务
    pub fn new() -> Self {
        // 使用默认的平台配置，避免依赖外部文件
        let platforms = vec![
            Platform::new(
                "netease".to_string(),
                "网易云音乐".to_string(),
                "🎵".to_string(),
                "高品质音乐平台".to_string(),
                vec!["audio".to_string(), "music".to_string()],
                None,
                true,
                1,
                Some(5),
                false,
            ),
            Platform::new(
                "qq".to_string(),
                "QQ音乐".to_string(),
                "🎶".to_string(),
                "海量音乐资源".to_string(),
                vec!["audio".to_string(), "music".to_string()],
                None,
                true,
                2,
                Some(5),
                false,
            ),
            Platform::new(
                "youtube".to_string(),
                "YouTube".to_string(),
                "📺".to_string(),
                "全球视频平台".to_string(),
                vec!["video".to_string()],
                None,
                true,
                1,
                Some(3),
                false,
            ),
            Platform::new(
                "bilibili".to_string(),
                "哔哩哔哩".to_string(),
                "📹".to_string(),
                "二次元视频社区".to_string(),
                vec!["video".to_string()],
                None,
                true,
                2,
                Some(3),
                false,
            ),
            Platform::new(
                "baidu".to_string(),
                "百度网盘".to_string(),
                "📁".to_string(),
                "云存储服务".to_string(),
                vec!["file".to_string(), "document".to_string(), "archive".to_string()],
                None,
                true,
                1,
                Some(2),
                true,
            ),
            Platform::new(
                "aliyun".to_string(),
                "阿里云盘".to_string(),
                "☁️".to_string(),
                "高速云存储".to_string(),
                vec!["file".to_string(), "document".to_string(), "archive".to_string()],
                None,
                true,
                2,
                Some(2),
                true,
            ),
        ];
        
        Self {
            platforms,
        }
    }

    /// 获取平台列表，支持参数过滤
    pub fn get_platforms(
        &self,
        file_type: Option<&str>,
        enabled_only: Option<bool>,
    ) -> Vec<Platform> {
        self.platforms
            .iter()
            .filter(|platform| {
                // 检查是否只返回启用的平台
                if let Some(true) = enabled_only {
                    if !platform.is_enabled {
                        return false;
                    }
                }

                // 检查是否根据文件类型过滤
                if let Some(file_type) = file_type {
                    if !platform.supports_type(file_type) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect()
    }
}
