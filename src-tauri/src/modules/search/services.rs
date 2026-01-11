// 搜索模块 - 服务层
use super::models::{SearchItem, SearchResponse, SearchSuggestion};
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
#[derive(Debug)]
pub struct SearchService {
    suggestions_config: SearchSuggestionsConfig,
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
        
        Self { suggestions_config }
    }

    /// 生成搜索项
    fn generate_search_item(
        &self,
        index: usize,
        query: &str,
        file_type: &str,
        platform: &str,
    ) -> SearchItem {
        SearchItem::new(
            format!("{}_{}_{}", file_type, platform, index),
            format!("{} - {} 搜索结果 #{}", query, file_type, index),
            format!("https://example.com/{}/{}", file_type, index),
            platform.to_string(),
            file_type.to_string(),
        )
    }

    /// 执行搜索
    pub fn search(
        &self,
        query: &str,
        file_type: &str,
        platform: &str,
        page: u32,
        page_size: u32,
    ) -> SearchResponse {
        // 模拟搜索结果
        let mut items = Vec::new();

        // 生成不同类型的mock数据
        let item_count = 20; // 模拟总共有20条数据

        for i in 0..item_count {
            items.push(self.generate_search_item(i, query, file_type, platform));
        }

        // 分页处理
        let total = items.len() as u32;
        let start = ((page - 1) * page_size) as usize;
        let end = (start + page_size as usize).min(items.len());
        let paginated_items = items[start..end].to_vec();

        // 构建响应
        SearchResponse::new(
            paginated_items,
            total,
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