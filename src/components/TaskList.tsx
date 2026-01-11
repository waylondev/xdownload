import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Download, Play, Pause, Trash2, Clock, File, DownloadCloud, CheckCircle2, AlertCircle, X, RotateCcw } from "lucide-react";
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
        return { 
          text: "下载中", 
          color: "text-blue-400", 
          bgColor: "bg-blue-500/20",
          icon: <DownloadCloud className="w-5 h-5" /> 
        };
      case "pending":
        return { 
          text: "等待中", 
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20", 
          icon: <Clock className="w-5 h-5" /> 
        };
      case "completed":
        return { 
          text: "已完成", 
          color: "text-green-400",
          bgColor: "bg-green-500/20", 
          icon: <CheckCircle2 className="w-5 h-5" /> 
        };
      case "paused":
        return { 
          text: "已暂停", 
          color: "text-slate-400",
          bgColor: "bg-slate-500/20", 
          icon: <Pause className="w-5 h-5" /> 
        };
      case "failed":
        return { 
          text: "下载失败", 
          color: "text-red-400",
          bgColor: "bg-red-500/20", 
          icon: <AlertCircle className="w-5 h-5" /> 
        };
      case "cancelled":
        return { 
          text: "已取消", 
          color: "text-gray-400",
          bgColor: "bg-gray-500/20", 
          icon: <X className="w-5 h-5" /> 
        };
      default:
        return { 
          text: status, 
          color: "text-slate-400",
          bgColor: "bg-slate-500/20", 
          icon: <Download className="w-5 h-5" /> 
        };
    }
  };

  return (
    <Card className={`bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden ${className || ''}`}>
      <CardHeader className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            下载任务 ({tasks.length})
          </h2>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-slate-900/80">
        {tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl">
              <File className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-3">暂无下载任务</h3>
            <p className="text-lg text-slate-500">搜索并下载内容后将显示在这里</p>
            <p className="text-sm text-slate-600 mt-2">支持音乐、视频、文件下载</p>
          </div>
        ) : (
          /* 移除overflow-x-auto，使用响应式表格设计 */
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800">
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap">文件名</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap">平台</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap">状态</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap">进度</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap hidden sm:table-cell">大小</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap hidden md:table-cell">速度</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tasks.map((task) => {
                const statusDisplay = getStatusDisplay(task.status as any);
                return (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors duration-200">
                    {/* 文件名 */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${statusDisplay.bgColor}`}>
                          {statusDisplay.icon}
                        </div>
                        <div className="min-w-0 max-w-[150px] sm:max-w-[250px]">
                          <h3 className="font-semibold text-slate-100 text-xs truncate">
                            {task.filename}
                          </h3>
                          <p className="text-xs text-slate-500 truncate hidden sm:block">
                            {task.url}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 平台 */}
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full text-slate-300 whitespace-nowrap">
                        {task.platform}
                      </span>
                    </td>
                    
                    {/* 状态 */}
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium ${statusDisplay.color} whitespace-nowrap`}>
                        {statusDisplay.text}
                      </span>
                    </td>
                    
                    {/* 进度 */}
                    <td className="px-3 py-3 min-w-[120px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 whitespace-nowrap">{task.progress}%</span>
                        </div>
                        {/* 优化的进度条 */}
                        <div className="relative h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    {/* 大小 - 在小屏幕上隐藏 */}
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs text-slate-300 whitespace-nowrap">
                        {task.downloaded || '0 B'} / {task.size || '未知'}
                      </span>
                    </td>
                    
                    {/* 速度 - 在中等屏幕以下隐藏 */}
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-300 whitespace-nowrap">
                        {task.status === "downloading" && task.speed ? task.speed : '-'}  
                      </span>
                    </td>
                    
                    {/* 操作按钮 - 紧凑设计 */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 控制按钮 - 图标化设计 */}
                        {(task.status === "downloading" || task.status === "paused" || task.status === "pending") && (
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => handleToggleTaskStatus(task.id)}
                            className="h-7 w-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-md transition-all duration-300"
                            title={task.status === "downloading" ? '暂停' : '开始'}
                          >
                            {task.status === "downloading" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                        )}
                        
                        {/* 删除按钮 - 图标化设计 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-md transition-all duration-300"
                          onClick={() => handleDeleteTask(task.id)}
                          title="删除"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;