import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Download, Play, Pause, Trash2 } from "lucide-react";
import { IpcDownloadService } from "../services/IpcDownloadService";

// 简化任务类型定义 - 使用any避免类型冲突
interface DownloadTask {
  id: string;
  url: string;
  filename: string;
  title?: string;
  progress: number;
  status: string;
  speed?: string;
  size?: string;
  downloaded?: string;
  fileType: string;
  platform: string;
  eta?: string;
  errorDetails?: string;
}

// 创建服务实例
const downloadService = new IpcDownloadService();

interface TaskListProps {
  tasks: DownloadTask[];
  onTaskUpdate?: (taskId: string, status: DownloadTask["status"]) => void;
  onTaskDelete?: (taskId: string) => void;
  className?: string;
}

const TaskList = ({ tasks, onTaskUpdate, onTaskDelete, className }: TaskListProps) => {
  // 切换任务状态（暂停/恢复）
  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === "downloading") {
      await downloadService.pauseDownload(taskId);
      if (onTaskUpdate) onTaskUpdate(taskId, "paused");
    } else if (task.status === "paused" || task.status === "pending") {
      await downloadService.resumeDownload(taskId);
      if (onTaskUpdate) onTaskUpdate(taskId, "downloading");
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    await downloadService.cancelDownload(taskId);
    if (onTaskDelete) onTaskDelete(taskId);
  };

  return (
    <Card className={`flex-1 flex flex-col ${className || ''}`}>
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-4 h-4" />
          下载任务 ({tasks.length})
        </h2>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="h-64 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无下载任务
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{task.filename}</div>
                      <div className="text-xs text-gray-500 truncate mt-1">{task.url}</div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      {task.status === "downloading" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleTaskStatus(task.id)}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {(task.status === "pending" || task.status === "paused") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleTaskStatus(task.id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={task.progress} className="flex-1" />
                    <span className="text-xs text-gray-500 w-12 text-right">{task.progress}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {task.status === "downloading" 
                        ? `${task.speed}` 
                        : task.status === "pending" 
                          ? "等待中" 
                          : task.status === "completed" 
                            ? "已完成" 
                            : task.status === "failed" 
                              ? "下载失败" 
                              : "已暂停"}
                    </span>
                    <span>{task.downloaded} / {task.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
