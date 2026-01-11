// 搜索模块 - 服务层
use super::models::{SearchItem, SearchResponse, SearchSuggestion};
use crate::modules::platforms::{PlatformServiceManager, PlatformSearchItem};
use rand::random;
use serde::{Deserialize, Serialize};

// 搜索建议平台配置
#[derive(Debug, Deserialize, Serialize)]
struct PlatformSuggestions {
    suggestions: Vec<String>,
}

// 搜索建议配置结构
#[derive(Debug, Deserialize, Serialize)]
struct SearchSuggestionsConfig {
    netease: PlatformSuggestions,
    youtube: PlatformSuggestions,
    bilibili: PlatformSuggestions,
    default: PlatformSuggestions,
}

/// 搜索服务
pub struct SearchService {
    suggestions_config: SearchSuggestionsConfig,
    platform_service_manager: PlatformServiceManager,
}

impl Default for SearchService {
    fn default() -> Self {
        Self::new()
    }
}

impl SearchService {
    /// 创建新的搜索服务
    pub fn new() -> Self {
        // 使用默认的搜索建议配置，避免依赖外部文件
        let suggestions_config = SearchSuggestionsConfig {
            netease: PlatformSuggestions {
                suggestions: vec!["音乐排行榜".to_string(), "热门歌曲".to_string(), "最新专辑".to_string(), "歌手合集".to_string(), "经典老歌".to_string()],
            },
            youtube: PlatformSuggestions {
                suggestions: vec!["热门视频".to_string(), "最新上传".to_string(), "视频教程".to_string(), "电影剪辑".to_string(), "游戏直播".to_string()],
            },
            bilibili: PlatformSuggestions {
                suggestions: vec!["番剧更新".to_string(), "游戏解说".to_string(), "科技资讯".to_string(), "生活vlog".to_string(), "美食制作".to_string()],
            },
            default: PlatformSuggestions {
                suggestions: vec!["热门推荐".to_string(), "最新内容".to_string(), "精选合集".to_string(), "热门话题".to_string(), "相关内容".to_string()],
            },
        };
        
        // 初始化平台服务管理器
        let platform_service_manager = PlatformServiceManager::new();
        
        Self {
            suggestions_config,
            platform_service_manager,
        }
    }

    /// 执行搜索
    pub async fn search(
        &self,
        query: &str,
        file_type: &str,
        platform: &str,
        page: u32,
        page_size: u32,
    ) -> SearchResponse {
        // 获取指定平台的搜索服务
        let search_service = self.platform_service_manager.get_search_service(platform);
        
        // 调用平台搜索服务
        let platform_items = if let Some(service) = search_service {
            service.search(query, file_type, page, page_size).await
        } else {
            Vec::new()
        };
        
        // 将平台搜索结果转换为搜索模块的结果格式
        let items: Vec<SearchItem> = platform_items.into_iter().map(|item| {
            SearchItem::new(
                item.id,
                item.title,
                item.url,
                item.platform,
                item.file_type,
            )
            .with_size(item.size.clone().unwrap_or_default())
            .with_duration(item.duration.clone().unwrap_or_default())
            .with_thumbnail(item.thumbnail.clone().unwrap_or_default())
            .with_description(item.description.clone().unwrap_or_default())
            .with_uploader(item.uploader.clone().unwrap_or_default())
            .with_upload_date(item.upload_date.clone().unwrap_or_default())
            .with_quality(item.quality.clone().unwrap_or_default())
            .with_format(item.format.clone().unwrap_or_default())
        }).collect();
        
        // 保存结果数量
        let total = items.len() as u32;
        
        // 构建响应
        SearchResponse::new(
            items,
            total, // 使用实际搜索结果数量
            page,
            page_size,
            Some(serde_json::json!({ "query": query, "platform": platform })),
        )
    }

    /// 获取搜索建议
    pub fn get_search_suggestions(&self, query: &str, platform: &str) -> Vec<SearchSuggestion> {
        // 从配置中获取搜索建议
        let base_suggestions = match platform {
            "netease" => &self.suggestions_config.netease.suggestions,
            "youtube" => &self.suggestions_config.youtube.suggestions,
            "bilibili" => &self.suggestions_config.bilibili.suggestions,
            _ => &self.suggestions_config.default.suggestions,
        };

        // 生成搜索建议
        base_suggestions
            .iter()
            .map(|s| {
                SearchSuggestion::new(
                    format!("{}{}", query, s),
                    "suggestion".to_string(),
                    Some(100 + random::<u32>() % 1000),
                )
            })
            .take(5)
            .collect()
    }
}