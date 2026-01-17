// 命令服务模块 - 职责单一，功能明确
use serde::Deserialize;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

/// 命令执行服务
#[derive(Debug)]
pub struct CommandService {
    app_handle: AppHandle,
}

impl CommandService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// 执行命令并实时输出
    pub async fn execute_command(&self, command: &str) -> Result<(), String> {
        use tokio::process::Command;
        use tokio::io::{AsyncBufReadExt, BufReader};

        // 解析命令
        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return Err("命令不能为空".to_string());
        }

        let program = parts[0];
        let args = &parts[1..];

        // 执行命令
        let mut cmd = Command::new(program);
        cmd.args(args);
        
        let mut child = cmd
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("启动命令失败: {}", e))?;

        // 读取输出
        let stdout = child.stdout.take().unwrap();
        let mut stdout_reader = BufReader::new(stdout).lines();
        
        let stderr = child.stderr.take().unwrap();
        let mut stderr_reader = BufReader::new(stderr).lines();

        // 实时转发输出
        loop {
            tokio::select! {
                result = stdout_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            let _ = self.app_handle.emit("terminal-output", &line);
                        }
                        Ok(None) => break,
                        Err(e) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("读取输出错误: {}", e));
                            break;
                        }
                    }
                }
                result = stderr_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("错误: {}", line));
                        }
                        Ok(None) => break,
                        Err(e) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("读取错误输出错误: {}", e));
                            break;
                        }
                    }
                }
                status = child.wait() => {
                    match status {
                        Ok(status) => {
                            if status.success() {
                                let _ = self.app_handle.emit("terminal-output", "命令执行成功");
                            } else {
                                let _ = self.app_handle.emit("terminal-output", &format!("命令执行失败，退出码: {}", status));
                            }
                            break;
                        }
                        Err(e) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("等待命令完成错误: {}", e));
                            break;
                        }
                    }
                }
            }
        }

        Ok(())
    }
}

/// 执行命令请求
#[derive(Debug, Deserialize)]
pub struct ExecuteCommandRequest {
    pub command: String,
}

/// 执行命令命令
#[tauri::command]
pub async fn execute_command(
    service: tauri::State<'_, Mutex<CommandService>>,
    request: ExecuteCommandRequest,
) -> Result<(), String> {
    let service = service.lock().await;
    service.execute_command(&request.command).await
}