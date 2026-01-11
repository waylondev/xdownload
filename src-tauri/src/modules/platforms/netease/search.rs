// 网易云音乐搜索服务实现
use crate::modules::platforms::{SearchService, PlatformSearchItem};
use crate::utils::time::{format_duration_millis, format_unix_timestamp};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::json;

/// 网易云音乐搜索服务
pub struct NeteaseSearchService {
    client: Client,
}

impl NeteaseSearchService {
    /// 创建新的网易云音乐搜索服务
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }
}

#[async_trait]
impl SearchService for NeteaseSearchService {
    async fn search(
        &self,
        query: &str,
        file_type: &str,
        page: u32,
        page_size: u32
    ) -> Vec<PlatformSearchItem> {
        // 使用网易云音乐公开API - 云音乐搜索API
        // 注意：这是一个第三方公开API，仅用于演示
        let url = "https://music.163.com/api/search/pc";
        
        let mut items = Vec::new();
        
        // 构建搜索参数
        let params = json!({
            "s": query,
            "type": 1, // 1表示单曲
            "offset": (page - 1) * page_size,
            "limit": page_size
        });
        
        // 调用网易云音乐搜索API
        match self.client.post(url)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(format!("params={}", urlencoding::encode(&params.to_string())))
            .send().await {
            Ok(response) => {
                eprintln!("网易云API响应状态码: {}", response.status());
                
                match response.json::<serde_json::Value>().await {
                    Ok(data) => {
                        eprintln!("网易云API原始响应: {:?}", data);
                        
                        // 解析搜索结果
                        if let Some(code) = data.get("code").and_then(|c| c.as_i64()) {
                            if code == 200 {
                                // 提取搜索结果数据
                                if let Some(result) = data.get("result") {
                                    if let Some(songs) = result.get("songs").and_then(|s| s.as_array()) {
                                        // 遍历搜索结果，获取指定数量的歌曲
                                        for song in songs.iter().take(page_size as usize) {
                                            // 提取必要的字段
                                            let id_value = song.get("id").and_then(|v| v.as_i64()).unwrap_or_default();
                                            let id = id_value.to_string();
                                            if id.is_empty() {
                                                continue;
                                            }
                                            
                                            let name = song.get("name").and_then(|n| n.as_str()).unwrap_or_default().to_string();
                                            let artists = song.get("artists").and_then(|a| a.as_array())
                                                .unwrap_or(&vec![])
                                                .iter()
                                                .map(|a| a.get("name").and_then(|n| n.as_str()).unwrap_or_default().to_string())
                                                .collect::<Vec<_>>().join(", ");
                                            
                                            let album_name = song.get("album").and_then(|a| a.get("name")).and_then(|n| n.as_str()).unwrap_or_default().to_string();
                                            let album_pic = song.get("album").and_then(|a| a.get("picUrl")).and_then(|p| p.as_str()).unwrap_or_default().to_string();
                                            let duration = song.get("duration").and_then(|d| d.as_i64()).unwrap_or(0);
                                            let publish_time = song.get("publishTime").and_then(|t| t.as_i64()).unwrap_or(0);
                                            
                                            // 构建标题
                                            let title = format!("{} - {}", name, artists);
                                            let url = format!("https://music.163.com/song?id={}", id);
                                            
                                            // 创建搜索结果项
                                            let search_item = PlatformSearchItem {
                                                id: id.clone(),
                                                title,
                                                url,
                                                platform: "netease".to_string(),
                                                file_type: "audio".to_string(),
                                                size: None,
                                                duration: Some(format_duration_millis(duration)),
                                                thumbnail: Some(album_pic),
                                                description: Some(album_name),
                                                uploader: Some(artists),
                                                upload_date: Some(format_unix_timestamp(publish_time / 1000)),
                                                quality: None,
                                                format: None,
                                                metadata: Some(json!({
                                                    "song_id": id_value,
                                                    "album_id": song.get("album").and_then(|a| a.get("id")).and_then(|i| i.as_i64()).unwrap_or(0),
                                                    "artist_ids": song.get("artists").and_then(|a| a.as_array())
                                                        .unwrap_or(&vec![])
                                                        .iter()
                                                        .map(|a| a.get("id").and_then(|i| i.as_i64()).unwrap_or(0))
                                                        .collect::<Vec<_>>(),
                                                    "duration": duration,
                                                    "publish_time": publish_time
                                                })),
                                            };
                                            
                                            items.push(search_item);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Err(e) => {
                        eprintln!("网易云API解析错误: {:?}", e);
                    }
                }
            },
            Err(e) => {
                eprintln!("网易云API请求错误: {:?}", e);
            }
        }
        
        eprintln!("网易云搜索结果数量: {}", items.len());
        
        items
    }
    
    fn get_platform_id(&self) -> &str {
        "netease"
    }
}
