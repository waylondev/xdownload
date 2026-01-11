// 时间相关工具函数

/// 格式化毫秒为分:秒格式
pub fn format_duration_millis(milliseconds: i64) -> String {
    let total_seconds = milliseconds / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}", minutes, seconds)
}

/// 格式化秒为分:秒格式
pub fn format_duration_seconds(seconds: i32) -> String {
    let minutes = seconds / 60;
    let secs = seconds % 60;
    
    if minutes >= 60 {
        let hours = minutes / 60;
        let mins = minutes % 60;
        format!("{:02}:{:02}:{:02}", hours, mins, secs)
    } else {
        format!("{:02}:{:02}", minutes, secs)
    }
}

/// 格式化Unix时间戳为日期字符串 (YYYY-MM-DD)
pub fn format_unix_timestamp(timestamp: i64) -> String {
    use time::OffsetDateTime;
    
    match OffsetDateTime::from_unix_timestamp(timestamp) {
        Ok(dt) => {
            dt.format(&time::format_description::well_known::Rfc3339)
                .unwrap_or("1970-01-01T00:00:00Z".to_string())
                .split("T")
                .next()
                .unwrap_or("1970-01-01")
                .to_string()
        }
        Err(_) => "1970-01-01".to_string(),
    }
}
