import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Download, Play, Pause, Trash2, Clock, File, DownloadCloud, CheckCircle2, AlertCircle, Clock3 } from "lucide-react";
import { IpcDownloadService } from "../services/IpcDownloadService";

// 下载任务类型定义
interface DownloadTask {
  id: string;
  url: string;
  filename: string;
  title?: string;
  progress: number;
  status: "pending" | "downloading" | "completed" | "failed" | "paused" | "cancelled";
  speed?: string;
  size?: string;
  downloaded?: string;
  fileType: string;
  platform: string;
  eta?: string;
  errorDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
    } else if (task.status === "pending" || task.status === "paused") {
      await downloadService.resumeDownload(taskId);
      if (onTaskUpdate) onTaskUpdate(taskId, "downloading");
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    await downloadService.cancelDownload(taskId);
    if (onTaskDelete) onTaskDelete(taskId);
  };

  // 获取状态显示
  const getStatusDisplay = (status: DownloadTask["status"]) => {
    switch (status) {
      case "downloading":
        return { text: "下载中", color: "text-blue-400", icon: <DownloadCloud className="w-4 h-4" /> };
      case "pending":
        return { text: "等待中", color: "text-yellow-400", icon: <Clock className="w-4 h-4" /> };
      case "completed":
        return { text: "已完成", color: "text-green-400", icon: <CheckCircle2 className="w-4 h-4" /> };
      case "paused":
        return { text: "已暂停", color: "text-slate-400", icon: <Pause className="w-4 h-4" /> };
      case "failed":
        return { text: "下载失败", color: "text-red-400", icon: <AlertCircle className="w-4 h-4" /> };
      case "cancelled":
        return { text: "已取消", color: "text-gray-400", icon: <Trash2 className="w-4 h-4" /> };
      default:
        return { text: status, color: "text-slate-400", icon: <Download className="w-4 h-4" /> };
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 shadow-lg hover:shadow-xl transition-shadow ${className || ''}`}>
      <CardHeader className="border-b border-slate-700 bg-slate-800/80">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          下载任务 ({tasks.length})
        </h2>
      </CardHeader>
      <CardContent className="p-0 bg-slate-800">
        <div className="h-96 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-4">📥</div>
              <p className="text-lg">暂无下载任务</p>
              <p className="text-sm mt-2 text-slate-500">搜索并下载内容后将显示在这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const statusDisplay = getStatusDisplay(task.status as any);
                return (
                  <div 
                    key={task.id} 
                    className="p-4 bg-slate-750 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {/* 任务头部 */}
                    <div className="flex items-start justify-between gap-4">
                      {/* 任务信息 */}
                      <div className="flex-1 min-w-0">
                        {/* 文件名 */}
                        <div className="flex items-center gap-2 mb-1">
                          <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <h3 className="font-semibold text-slate-100 text-sm truncate">
                            {task.filename}
                          </h3>
                          <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400 capitalize">
                            {task.platform}
                          </span>
                        </div>
                        
                        {/* URL */}
                        <p className="text-xs text-slate-500 truncate mb-3">
                          {task.url}
                        </p>
                        
                        {/* 进度条 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">进度</span>
                            <span className={`font-medium ${statusDisplay.color}`}>
                              {statusDisplay.text}
                            </span>
                          </div>
                          
                          <div className="relative">
                            <Progress 
                              value={task.progress} 
                              className="h-3 bg-slate-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-end pr-2">
                              <span className="text-xs font-mono text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded min-w-12 text-center">
                                {task.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 下载统计 */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs">
                          {/* 速度和ETA */}
                          {task.status === "downloading" && (
                            <>
                              <div className="flex items-center gap-1 text-slate-400">
                                <DownloadCloud className="w-3.5 h-3.5" />
                                <span>{task.speed || '0 B/s'}</span>
                              </div>
                              {task.eta && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>剩余 {task.eta}</span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* 文件大小 */}
                          <div className="flex items-center gap-1 text-slate-400">
                            <File className="w-3.5 h-3.5" />
                            <span>
                              {task.downloaded || '0 B'} / {task.size || '未知'}
                            </span>
                          </div>
                          
                          {/* 任务时间 */}
                          {task.updatedAt && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock3 className="w-3.5 h-3.5" />
                              <span>
                                {new Date(task.updatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-1 items-center">
                        {/* 状态图标 */}
                        <div className={`p-2 rounded-full ${statusDisplay.color.replace('text-', 'bg-').replace('400', '500/20')} mb-2`}>
                          {statusDisplay.icon}
                        </div>
                        
                        {/* 控制按钮 */}
                        {(task.status === "downloading" || task.status === "paused" || task.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleTaskStatus(task.id)}
                            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-slate-200"
                          >
                            {task.status === "downloading" ? 
                              <Pause className="w-4 h-4" /> : 
                              <Play className="w-4 h-4" />
                            }
                          </Button>
                        )}
                        
                        {/* 删除按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;