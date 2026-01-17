// 基础设施层 - 仓储实现
use std::collections::HashMap;
use std::sync::Arc;
use async_trait::async_trait;
use tokio::sync::RwLock;

use crate::domain::{
    entities::DownloadTask,
    repository::DownloadTaskRepository
};

/// 内存中的下载任务仓储实现
pub struct InMemoryDownloadTaskRepository {
    tasks: Arc<RwLock<HashMap<String, DownloadTask>>>,
}

impl InMemoryDownloadTaskRepository {
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl DownloadTaskRepository for InMemoryDownloadTaskRepository {
    async fn save(&self, task: &DownloadTask) -> Result<(), String> {
        let mut tasks = self.tasks.write().await;
        tasks.insert(task.id.clone(), task.clone());
        Ok(())
    }
    
    async fn find_by_id(&self, task_id: &str) -> Result<Option<DownloadTask>, String> {
        let tasks = self.tasks.read().await;
        Ok(tasks.get(task_id).cloned())
    }
    
    async fn find_all(&self) -> Result<Vec<DownloadTask>, String> {
        let tasks = self.tasks.read().await;
        Ok(tasks.values().cloned().collect())
    }
    
    async fn update(&self, task: &DownloadTask) -> Result<(), String> {
        let mut tasks = self.tasks.write().await;
        if tasks.contains_key(&task.id) {
            tasks.insert(task.id.clone(), task.clone());
            Ok(())
        } else {
            Err("Task not found".to_string())
        }
    }
    
    async fn delete(&self, task_id: &str) -> Result<(), String> {
        let mut tasks = self.tasks.write().await;
        if tasks.remove(task_id).is_some() {
            Ok(())
        } else {
            Err("Task not found".to_string())
        }
    }
}