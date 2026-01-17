// CommandService module - Core logic for command execution and Tauri interfaces
use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;

/// Command execution service
pub struct CommandService {
    app_handle: AppHandle,
}

impl CommandService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// Execute command with real-time output
    pub async fn execute_command(&self, command: &str) -> Result<(), String> {
        use tokio::process::Command;
        use tokio::io::{AsyncBufReadExt, BufReader};

        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return Err("Command cannot be empty".to_string());
        }

        let program = parts[0];
        let args = &parts[1..];

        // Execute command directly, assuming yt-dlp is in system PATH
        let mut cmd = Command::new(program);
        cmd.args(args);
        
        let mut child = cmd
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start command: {}", e))?;

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
                            // Ignore encoding errors and continue
                            continue;
                        }
                    }
                }
                result = stderr_reader.next_line() => {
                    match result {
                        Ok(Some(line)) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("Error: {}", line));
                        }
                        Ok(None) => break,
                        Err(_) => {
                            // Ignore encoding errors and continue
                            continue;
                        }
                    }
                }
                status = child.wait() => {
                    match status {
                        Ok(status) => {
                            if status.success() {
                                let _ = self.app_handle.emit("terminal-output", "Command executed successfully");
                            } else {
                                let _ = self.app_handle.emit("terminal-output", &format!("Command execution failed, exit code: {}", status));
                            }
                            break;
                        }
                        Err(e) => {
                            let _ = self.app_handle.emit("terminal-output", &format!("Error waiting for command completion: {}", e));
                            break;
                        }
                    }
                }
            }
        }

        Ok(())
    }
}

/// Execute command request
#[derive(Debug, Deserialize)]
pub struct ExecuteCommandRequest {
    pub command: String,
}

/// Tauri command interface
#[tauri::command]
pub async fn execute_command(
    service: State<'_, Mutex<CommandService>>,
    request: ExecuteCommandRequest,
) -> Result<(), String> {
    let service = service.lock().await;
    service.execute_command(&request.command).await
}