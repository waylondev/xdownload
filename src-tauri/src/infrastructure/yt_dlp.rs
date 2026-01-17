// 基础设施层 - yt-dlp集成实现
use std::process::{Command, Stdio};
use std::str;
use async_trait::async_trait;
use tokio::io::{AsyncBufReadExt, BufReader};

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
        // 使用yt-dlp解析URL
        let output = Command::new("./bin/yt-dlp.exe")
            .args(["--dump-json", url])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("yt-dlp error: {}", stderr));
        }
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        let info: serde_json::Value = serde_json::from_str(&stdout)
            .map_err(|e| format!("Failed to parse yt-dlp output: {}", e))?;
        
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
            for format_info in formats_array {
                if let Ok(format) = serde_json::from_value::<VideoFormat>(format_info.clone()) {
                    formats.push(format);
                }
            }
        }
        
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
        // 构建yt-dlp命令
        let mut args = vec![
            "-o", "./downloads/%(title)s.%(ext)s",
            "--newline", // 输出进度信息
        ];
        
        if let Some(format) = format_id {
            args.push("-f");
            args.push(format);
        }
        
        args.push(url);
        
        let mut child = Command::new("./bin/yt-dlp.exe")
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start yt-dlp: {}", e))?;
        
        // 读取进度输出
        let stdout = child.stdout.take().unwrap();
        let mut reader = BufReader::new(tokio::process::ChildStdout::from_std(stdout).unwrap());
        
        loop {
            let mut line = String::new();
            match tokio::time::timeout(
                std::time::Duration::from_secs(1),
                reader.read_line(&mut line)
            ).await {
                Ok(Ok(0)) => break, // EOF
                Ok(Ok(_)) => {
                    // 解析进度信息
                    if line.contains("%") {
                        if let Some(progress) = Self::parse_progress(&line) {
                            let speed = Self::parse_speed(&line).unwrap_or_else(|| "0 KB/s".to_string());
                            progress_callback(progress, speed);
                        }
                    }
                }
                _ => break,
            }
        }
        
        let status = child.wait()
            .map_err(|e| format!("Failed to wait for yt-dlp: {}", e))?;
        
        if status.success() {
            Ok(())
        } else {
            Err("Download failed".to_string())
        }
    }
}