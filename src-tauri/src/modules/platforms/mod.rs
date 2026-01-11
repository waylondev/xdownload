// 平台模块 - 统一的平台服务接口
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// 平台服务返回的搜索结果项
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlatformSearchItem {
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

// 平台服务返回的下载信息
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlatformDownloadInfo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub platform: String,
    pub file_type: String,
    pub size: Option<String>,
    pub quality: Option<String>,
    pub format: Option<String>,
    pub download_url: String,
    pub metadata: Option<serde_json::Value>,
}

/// 平台搜索服务统一接口
#[async_trait::async_trait]
pub trait SearchService {
    /// 搜索数据
    async fn search(
        &self,
        query: &str,
        file_type: &str,
        page: u32,
        page_size: u32
    ) -> Vec<PlatformSearchItem>;
    
    /// 获取平台ID
    fn get_platform_id(&self) -> &str;
}

/// 平台下载服务统一接口
#[async_trait::async_trait]
pub trait DownloadService {
    /// 获取下载信息
    async fn get_download_info(
        &self,
        item_id: &str,
        quality: Option<&str>,
        format: Option<&str>
    ) -> Result<PlatformDownloadInfo, String>;
    
    /// 开始下载
    async fn start_download(
        &self,
        download_info: &PlatformDownloadInfo,
        save_path: &str
    ) -> Result<String, String>;
    
    /// 获取平台ID
    fn get_platform_id(&self) -> &str;
}

// 平台服务管理器
pub struct PlatformServiceManager {
    search_services: Vec<Arc<dyn SearchService + Send + Sync>>,
    download_services: Vec<Arc<dyn DownloadService + Send + Sync>>,
}

impl PlatformServiceManager {
    /// 创建新的平台服务管理器
    pub fn new() -> Self {
        // 初始化各平台服务
        let netease_search = Arc::new(crate::modules::platforms::netease::search::NeteaseSearchService::new());
        let netease_download = Arc::new(crate::modules::platforms::netease::download::NeteaseDownloadService::new());
        
        let qq_search = Arc::new(crate::modules::platforms::qq::search::QQSearchService::new());
        let qq_download = Arc::new(crate::modules::platforms::qq::download::QQDownloadService::new());
        
        let youtube_search = Arc::new(crate::modules::platforms::youtube::search::YouTubeSearchService::new());
        let youtube_download = Arc::new(crate::modules::platforms::youtube::download::YouTubeDownloadService::new());
        
        let bilibili_search = Arc::new(crate::modules::platforms::bilibili::search::BilibiliSearchService::new());
        let bilibili_download = Arc::new(crate::modules::platforms::bilibili::download::BilibiliDownloadService::new());
        
        let baidu_search = Arc::new(crate::modules::platforms::baidu::search::BaiduSearchService::new());
        let baidu_download = Arc::new(crate::modules::platforms::baidu::download::BaiduDownloadService::new());
        
        let aliyun_search = Arc::new(crate::modules::platforms::aliyun::search::AliyunSearchService::new());
        let aliyun_download = Arc::new(crate::modules::platforms::aliyun::download::AliyunDownloadService::new());
        
        Self {
            search_services: vec![
                netease_search,
                qq_search,
                youtube_search,
                bilibili_search,
                baidu_search,
                aliyun_search,
            ],
            download_services: vec![
                netease_download,
                qq_download,
                youtube_download,
                bilibili_download,
                baidu_download,
                aliyun_download,
            ],
        }
    }
    
    /// 获取指定平台的搜索服务
    pub fn get_search_service(&self, platform: &str) -> Option<Arc<dyn SearchService + Send + Sync>> {
        self.search_services.iter()
            .find(|s| s.get_platform_id() == platform)
            .cloned()
    }
    
    /// 获取指定平台的下载服务
    pub fn get_download_service(&self, platform: &str) -> Option<Arc<dyn DownloadService + Send + Sync>> {
        self.download_services.iter()
            .find(|s| s.get_platform_id() == platform)
            .cloned()
    }
    
    /// 获取所有平台的搜索服务
    pub fn get_all_search_services(&self) -> Vec<Arc<dyn SearchService + Send + Sync>> {
        self.search_services.clone()
    }
    
    /// 获取所有平台的下载服务
    pub fn get_all_download_services(&self) -> Vec<Arc<dyn DownloadService + Send + Sync>> {
        self.download_services.clone()
    }
}

// 导出各平台的服务
pub mod netease {
    pub mod search;
    pub mod download;
}

pub mod qq {
    pub mod search;
    pub mod download;
}

pub mod youtube {
    pub mod search;
    pub mod download;
}

pub mod bilibili {
    pub mod search;
    pub mod download;
}

pub mod baidu {
    pub mod search;
    pub mod download;
}

pub mod aliyun {
    pub mod search;
    pub mod download;
}
