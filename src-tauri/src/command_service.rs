// CommandService模块 - 命令执行的核心逻辑和Tauri接口
use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;

/// 命令执行服务
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

        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return Err("命令不能为空".to_string());
        }

        let program = parts[0];
        let args = &parts[1..];

        // 直接使用bin目录中的可执行文件
        let current_dir = std::env::current_dir()
            .map_err(|e| format!("获取当前目录失败: {}", e))?;
        
        let bin_path = current_dir
            .join("bin")
            .join(program);
        
        if !bin_path.exists() {
            return Err(format!("{} 未找到，请确保bin目录中存在该文件", program));
        }
        
        let mut cmd = Command::new(bin_path);
        cmd.args(args);
        
        let mut child = cmd
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("启动命令失败: {}", e))?;

        let stdout = child.stdout.take().unwrap();
        let mut stdout_reader = BufReader::new(stdout).lines();
        
        let stderr = child.stderr.take().unwrap();
        let mut stderr_reader = BufReader::new(stderr).lines();

        loop {
            tokio::select! {
                result = stdout_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            let _ = self.app_handle.emit("terminal-output", &line);
                        }
                        Ok(None) => break,
                        Err(_) => {
                            // 忽略编码错误，继续执行
                            continue;
                        }
                    }
                }
                result = stderr_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("错误: {}", line));
                        }
                        Ok(None) => break,
                        Err(_) => {
                            // 忽略编码错误，继续执行
                            continue;
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

/// Tauri命令接口
#[tauri::command]
pub async fn execute_command(
    service: State<'_, Mutex<CommandService>>,
    request: ExecuteCommandRequest,
) -> Result<(), String> {
    let service = service.lock().await;
    service.execute_command(&request.command).await
}