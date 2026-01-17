// 基础设施层 - yt-dlp集成实现
use std::process::{Command, Stdio};
use std::str;
use async_trait::async_trait;
use tokio::io::{AsyncBufReadExt, BufReader};
use log::{info, warn, error, debug};

use crate::domain::{
    entities::{ParseResult, VideoFormat},
    repository::{UrlParser, ContentDownloader}
};

/// yt-dlp URL解析器实现
pub struct YtDlpUrlParser;

impl YtDlpUrlParser {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl UrlParser for YtDlpUrlParser {
    async fn parse_url(&self, url: &str) -> Result<ParseResult, String> {
        info!("开始解析URL: {}", url);
        
        // 使用yt-dlp解析URL
        let yt_dlp_path = "../bin/yt-dlp.exe";
        debug!("yt-dlp路径: {}", yt_dlp_path);
        
        let output = Command::new(yt_dlp_path)
            .args(["--dump-json", url])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| {
                error!("执行yt-dlp失败: {}", e);
                format!("Failed to execute yt-dlp: {}", e)
            })?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!("yt-dlp执行错误: {}", stderr);
            return Err(format!("yt-dlp error: {}", stderr));
        }
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        debug!("yt-dlp输出长度: {} 字节", stdout.len());
        
        let info: serde_json::Value = serde_json::from_str(&stdout)
            .map_err(|e| {
                error!("解析yt-dlp输出失败: {}", e);
                format!("Failed to parse yt-dlp output: {}", e)
            })?;
        
        // 解析视频信息
        let title = info["title"]
            .as_str()
            .ok_or("Missing title in response")?
            .to_string();
        
        let duration = info["duration"].as_f64();
        
        let thumbnail = info["thumbnail"].as_str().map(|s| s.to_string());
        
        // 解析可用格式
        let mut formats = Vec::new();
        if let Some(formats_array) = info["formats"].as_array() {
            info!("找到 {} 个可用格式", formats_array.len());
            for format_info in formats_array {
                if let Ok(format) = serde_json::from_value::<VideoFormat>(format_info.clone()) {
                    formats.push(format);
                }
            }
        }
        
        info!("URL解析成功: 标题='{}', 时长={:?}, 缩略图={:?}, 格式数={}", 
              title, duration, thumbnail.is_some(), formats.len());
        
        Ok(ParseResult {
            title,
            duration,
            thumbnail,
            formats,
        })
    }
}

/// yt-dlp内容下载器实现
pub struct YtDlpContentDownloader;

impl YtDlpContentDownloader {
    pub fn new() -> Self {
        Self
    }
    
    /// 解析进度输出
    fn parse_progress(line: &str) -> Option<f32> {
        if let Some(start) = line.find("[") {
            if let Some(end) = line.find("%") {
                if let Some(percent_start) = line[start..end].rfind(' ') {
                    let percent_str = &line[start + percent_start + 1..end];
                    return percent_str.parse::<f32>().ok();
                }
            }
        }
        None
    }
    
    /// 解析下载速度
    fn parse_speed(line: &str) -> Option<String> {
        if let Some(at_pos) = line.find("at") {
            if let Some(end_pos) = line[at_pos..].find(' ') {
                let speed_str = &line[at_pos + 3..at_pos + end_pos];
                return Some(speed_str.to_string());
            }
        }
        None
    }
}

#[async_trait]
impl ContentDownloader for YtDlpContentDownloader {
    async fn download_content(
        &self, 
        url: &str, 
        format_id: Option<&str>,
        progress_callback: Box<dyn Fn(f32, String) + Send + Sync>
    ) -> Result<(), String> {
        info!("开始下载内容: URL={}, 格式={:?}", url, format_id);
        
        // 构建yt-dlp命令
        // 创建下载目录
        let downloads_dir = "../downloads";
        std::fs::create_dir_all(downloads_dir)
            .map_err(|e| {
                error!("创建下载目录失败: {}", e);
                format!("Failed to create downloads directory: {}", e)
            })?;
        info!("下载目录已创建: {}", downloads_dir);
        
        // 设置下载输出路径
        let output_path = "../downloads/%(title)s.%(ext)s";
        
        let mut args = vec![
            "-o", output_path,
            "--newline", // 输出进度信息
        ];
        
        if let Some(format) = format_id {
            args.push("-f");
            args.push(format);
            info!("使用指定格式下载: {}", format);
        } else {
            info!("使用默认格式下载");
        }
        
        args.push(url);
        
        let yt_dlp_path = "../bin/yt-dlp.exe";
        debug!("yt-dlp命令: {} {}", yt_dlp_path, args.join(" "));
        
        let mut child = Command::new(yt_dlp_path)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                error!("启动yt-dlp失败: {}", e);
                format!("Failed to start yt-dlp: {}", e)
            })?;
        info!("yt-dlp进程已启动");
        
        // 读取进度输出
        let stdout = child.stdout.take().unwrap();
        let mut reader = BufReader::new(tokio::process::ChildStdout::from_std(stdout).unwrap());
        
        info!("开始监控下载进度");
        let mut last_progress = 0.0;
        
        loop {
            let mut line = String::new();
            match tokio::time::timeout(
                std::time::Duration::from_secs(1),
                reader.read_line(&mut line)
            ).await {
                Ok(Ok(0)) => {
                    info!("下载输出结束 (EOF)");
                    break; // EOF
                }
                Ok(Ok(_)) => {
                    // 解析进度信息
                    if line.contains("%") {
                        if let Some(progress) = Self::parse_progress(&line) {
                            let speed = Self::parse_speed(&line).unwrap_or_else(|| "0 KB/s".to_string());
                            
                            // 只在进度有显著变化时记录日志
                            if (progress - last_progress).abs() > 5.0 {
                                info!("下载进度: {:.1}%, 速度: {}", progress, speed);
                                last_progress = progress;
                            }
                            
                            progress_callback(progress, speed);
                        }
                    }
                }
                _ => {
                    warn!("读取进度超时或出错");
                    break;
                }
            }
        }
        
        info!("等待yt-dlp进程结束");
        let status = child.wait()
            .map_err(|e| {
                error!("等待yt-dlp进程失败: {}", e);
                format!("Failed to wait for yt-dlp: {}", e)
            })?;
        
        if status.success() {
            info!("下载成功完成");
            Ok(())
        } else {
            error!("下载失败，退出码: {}", status);
            Err("Download failed".to_string())
        }
    }
}