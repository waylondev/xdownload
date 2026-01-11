// Bilibili搜索服务实现
use crate::modules::platforms::{SearchService, PlatformSearchItem};
use crate::utils::time::{format_duration_seconds, format_unix_timestamp};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;

/// Bilibili搜索服务
pub struct BilibiliSearchService {
    client: Client,
}

impl BilibiliSearchService {
    /// 创建新的Bilibili搜索服务
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }
}

#[async_trait]
impl SearchService for BilibiliSearchService {
    async fn search(
        &self,
        query: &str,
        file_type: &str,
        page: u32,
        page_size: u32
    ) -> Vec<PlatformSearchItem> {
        // 使用B站排行榜API，不需要wbi签名
        let url = "https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all".to_string();
        
        let mut items = Vec::new();
        
        // 调用B站排行榜API
        match self.client.get(&url).send().await {
            Ok(response) => {
                eprintln!("B站API响应状态码: {}", response.status());
                
                match response.json::<serde_json::Value>().await {
                    Ok(data) => {
                        eprintln!("B站API原始响应: {:?}", data);
                        
                        // 解析排行榜结果
                        if let Some(code) = data.get("code").and_then(|c| c.as_i64()) {
                            if code == 0 {
                                // 提取排行榜数据
                                if let Some(data_obj) = data.get("data") {
                                    if let Some(list) = data_obj.get("list").and_then(|l| l.as_array()) {
                                        // 遍历排行榜列表，获取指定数量的结果
                                        for item in list.iter().take(page_size as usize) {
                                            // 提取必要的字段
                                            let bvid = item.get("bvid").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                            if bvid.is_empty() {
                                                continue;
                                            }
                                            
                                            let title = item.get("title").and_then(|t| t.as_str()).unwrap_or_default().to_string();
                                            let pic = item.get("pic").and_then(|p| p.as_str()).unwrap_or_default().to_string();
                                            let author = item.get("owner")
                                                .and_then(|o| o.get("name"))
                                                .and_then(|n| n.as_str())
                                                .unwrap_or_default().to_string();
                                            
                                            let arcurl = format!("https://www.bilibili.com/video/{}", bvid);
                                            let duration = item.get("duration").and_then(|d| d.as_i64()).unwrap_or(0) as i32;
                                            let pubdate = item.get("pubdate").and_then(|p| p.as_i64()).unwrap_or(0);
                                            
                                            // 从stat对象中获取播放数和弹幕数
                                            let play = item.get("stat")
                                                .and_then(|s| s.get("view"))
                                                .and_then(|v| v.as_i64())
                                                .unwrap_or(0);
                                            
                                            let danmaku = item.get("stat")
                                                .and_then(|s| s.get("danmaku"))
                                                .and_then(|d| d.as_i64())
                                                .unwrap_or(0);
                                            
                                            // 创建搜索结果项
                                            let search_item = PlatformSearchItem {
                                                id: bvid,
                                                title,
                                                url: arcurl,
                                                platform: "bilibili".to_string(),
                                                file_type: "video".to_string(),
                                                size: None,
                                                duration: Some(format_duration_seconds(duration)),
                                                thumbnail: Some(pic),
                                                description: None,
                                                uploader: Some(author),
                                                upload_date: Some(format_unix_timestamp(pubdate)),
                                                quality: None,
                                                format: None,
                                                metadata: Some(json!({"play": play, "danmaku": danmaku})),
                                            };
                                            
                                            items.push(search_item);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Err(e) => {
                        eprintln!("B站API解析错误: {:?}", e);
                    }
                }
            },
            Err(e) => {
                eprintln!("B站API请求错误: {:?}", e);
            }
        }
        
        eprintln!("B站搜索结果数量: {}", items.len());
        
        items
    }
    
    fn get_platform_id(&self) -> &str {
        "bilibili"
    }
}
