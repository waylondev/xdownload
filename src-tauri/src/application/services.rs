// 应用层 - 业务逻辑服务
use tauri::{AppHandle, Emitter};

/// 下载服务
pub struct DownloadService {
    app_handle: AppHandle,
}

impl DownloadService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// 执行命令
    pub async fn execute_command(&self, command: &str) -> Result<(), String> {
        // 解析命令（简单处理，直接执行）
        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return Err("命令不能为空".to_string());
        }

        // 获取命令和参数
        let program = parts[0];
        let args = &parts[1..];

        // 执行命令
        self.execute_system_command(program, args).await
    }

    /// 执行系统命令并实时输出
    async fn execute_system_command(&self, program: &str, args: &[&str]) -> Result<(), String> {
        use tokio::process::Command;
        use tokio::io::{AsyncBufReadExt, BufReader};

        // 创建命令
        let mut cmd = Command::new(program);
        cmd.args(args);
        
        // 设置输出管道
        let mut child = cmd
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("启动命令失败: {}", e))?;

        // 读取标准输出
        let stdout = child.stdout.take().unwrap();
        let mut stdout_reader = BufReader::new(stdout).lines();
        
        // 读取标准错误
        let stderr = child.stderr.take().unwrap();
        let mut stderr_reader = BufReader::new(stderr).lines();

        // 实时读取输出
        loop {
            tokio::select! {
                result = stdout_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            // 发送输出到前端
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
                            // 发送错误输出到前端
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