// 搜索模块 - 模型定义
use serde::{Deserialize, Serialize};

/// 搜索项模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchItem {
    pub id: String,
    pub title: String,
    pub url: String,
    pub platform: String,
    pub file_type: String,
    pub size: Option<String>,
    pub duration: Option<String>,
    pub thumbnail: Option<String>,
    pub description: Option<String>,
    pub uploader: Option<String>,
    pub upload_date: Option<String>,
    pub quality: Option<String>,
    pub format: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

impl SearchItem {
    /// 创建新搜索项
    pub fn new(
        id: String,
        title: String,
        url: String,
        platform: String,
        file_type: String,
    ) -> Self {
        Self {
            id,
            title,
            url,
            platform,
            file_type,
            size: None,
            duration: None,
            thumbnail: None,
            description: None,
            uploader: None,
            upload_date: None,
            quality: None,
            format: None,
            metadata: None,
        }
    }

    /// 设置大小
    pub fn with_size(mut self, size: String) -> Self {
        self.size = Some(size);
        self
    }

    /// 设置时长
    pub fn with_duration(mut self, duration: String) -> Self {
        self.duration = Some(duration);
        self
    }

    /// 设置缩略图
    pub fn with_thumbnail(mut self, thumbnail: String) -> Self {
        self.thumbnail = Some(thumbnail);
        self
    }
}

/// 搜索响应模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResponse {
    pub items: Vec<SearchItem>,
    pub total: u32,
    pub page: u32,
    pub page_size: u32,
    pub total_pages: u32,
    pub metadata: Option<serde_json::Value>,
}

impl SearchResponse {
    /// 创建新搜索响应
    pub fn new(
        items: Vec<SearchItem>,
        total: u32,
        page: u32,
        page_size: u32,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        let total_pages = if page_size == 0 {
            0
        } else {
            (total + page_size - 1) / page_size
        };

        Self {
            items,
            total,
            page,
            page_size,
            total_pages,
            metadata,
        }
    }
}

/// 搜索建议模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchSuggestion {
    pub text: String,
    pub type_: String,
    pub count: Option<u32>,
}

impl SearchSuggestion {
    /// 创建新搜索建议
    pub fn new(text: String, type_: String, count: Option<u32>) -> Self {
        Self { text, type_, count }
    }
}
