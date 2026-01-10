// 下载模块 - 服务层
use std::time::{SystemTime, UNIX_EPOCH};

use super::models::DownloadTask;

/// 下载服务实现
#[derive(Debug, Default)]
pub struct DownloadService {
    pub tasks: Vec<DownloadTask>,
}

impl DownloadService {
    /// 创建新的下载服务
    pub fn new() -> Self {
        Self { tasks: Vec::new() }
    }

    /// 开始下载
    pub fn start_download(
        &mut self,
        url: &str,
        filename: &str,
        download_type: &str,
        platform: &str,
    ) -> String {
        let id = format!(
            "task_{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );

        let task = DownloadTask::new(
            id.clone(),
            url.to_string(),
            filename.to_string(),
            download_type.to_string(),
            platform.to_string(),
        );

        self.tasks.push(task);
        id
    }

    /// 获取所有下载任务
    pub fn get_all_tasks(&self) -> Vec<DownloadTask> {
        self.tasks.clone()
    }

    /// 根据ID获取下载任务
    pub fn get_task_by_id(&self, id: &str) -> Option<DownloadTask> {
        self.tasks.iter().find(|t| t.id == id).cloned()
    }

    /// 更新任务
    fn update_task(&mut self, task: DownloadTask) -> Result<(), String> {
        if let Some(index) = self.tasks.iter().position(|t| t.id == task.id) {
            self.tasks[index] = task;
            Ok(())
        } else {
            Err("Task not found".to_string())
        }
    }

    /// 取消下载
    pub fn cancel_download(&mut self, id: &str) -> Result<(), String> {
        if let Some(mut task) = self.get_task_by_id(id) {
            task.cancel();
            self.update_task(task)
        } else {
            Err("Task not found".to_string())
        }
    }

    /// 暂停下载
    pub fn pause_download(&mut self, id: &str) -> Result<(), String> {
        if let Some(mut task) = self.get_task_by_id(id) {
            task.pause();
            self.update_task(task)
        } else {
            Err("Task not found".to_string())
        }
    }

    /// 恢复下载
    pub fn resume_download(&mut self, id: &str) -> Result<(), String> {
        if let Some(mut task) = self.get_task_by_id(id) {
            task.resume();
            self.update_task(task)
        } else {
            Err("Task not found".to_string())
        }
    }
}
