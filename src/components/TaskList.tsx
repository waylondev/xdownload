import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Download, Play, Pause, Trash2, Clock, File, DownloadCloud, CheckCircle2, AlertCircle, Clock3, X, RotateCcw } from "lucide-react";
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
      <CardContent className="p-4 bg-slate-900/80">
        <div className="space-y-4">
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
            tasks.map((task) => {
              const statusDisplay = getStatusDisplay(task.status as any);
              return (
                <div 
                  key={task.id} 
                  className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-lg hover:shadow-blue-500/10"
                >
                  {/* 任务卡片装饰 */}
                  {task.status === "downloading" && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
                  )}
                  
                  <div className="p-5">
                    {/* 任务头部 */}
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* 任务信息 */}
                      <div className="flex-1 min-w-0">
                        {/* 文件名和平台 */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                              <File className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-slate-100 truncate group-hover:text-blue-400 transition-colors duration-300">
                              {task.filename}
                            </h3>
                          </div>
                          
                          {/* 状态标签 */}
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color} text-sm font-medium`}>
                              {statusDisplay.icon}
                              <span>{statusDisplay.text}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* URL */}
                        <p className="text-xs text-slate-500 truncate mb-4">
                          {task.url}
                        </p>
                        
                        {/* 进度条 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">下载进度</span>
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-semibold text-blue-400">{task.progress}%</span>
                              {task.status === "downloading" && task.speed && (
                                <span className="text-slate-500 flex items-center gap-1">
                                  <DownloadCloud className="w-3.5 h-3.5" />
                                  {task.speed}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 现代化进度条 */}
                          <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                            {/* 背景渐变 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-900"></div>
                            
                            {/* 进度填充 */}
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-300 ease-out"
                              style={{ width: `${task.progress}%` }}
                            >
                              {/* 发光效果 */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                            
                            {/* 进度指示器 */}
                            {task.progress > 0 && (
                              <div 
                                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-blue-500/50 animate-pulse"
                                style={{
                                  left: `calc(${task.progress}% - 8px)`,
                                }}
                              ></div>
                            )}
                          </div>
                        </div>
                        
                        {/* 下载统计 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          {/* 文件大小 */}
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <File className="w-4 h-4" />
                            <div>
                              <div className="text-xs text-slate-600">文件大小</div>
                              <div className="text-slate-300">
                                {task.downloaded || '0 B'} / {task.size || '未知'}
                              </div>
                            </div>
                          </div>
                          
                          {/* 速度和ETA */}
                          {task.status === "downloading" && (
                            <>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <DownloadCloud className="w-4 h-4" />
                                <div>
                                  <div className="text-xs text-slate-600">下载速度</div>
                                  <div className="text-slate-300">{task.speed || '0 B/s'}</div>
                                </div>
                              </div>
                              {task.eta && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Clock className="w-4 h-4" />
                                  <div>
                                    <div className="text-xs text-slate-600">剩余时间</div>
                                    <div className="text-slate-300">{task.eta}</div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* 平台信息 */}
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400">{task.platform.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-xs text-slate-600">来源平台</div>
                              <div className="text-slate-300">{task.platform}</div>
                            </div>
                          </div>
                          
                          {/* 任务时间 */}
                          {task.updatedAt && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock3 className="w-4 h-4" />
                              <div>
                                <div className="text-xs text-slate-600">更新时间</div>
                                <div className="text-slate-300">
                                  {new Date(task.updatedAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-3 justify-center">
                        {/* 控制按钮 */}
                        {(task.status === "downloading" || task.status === "paused" || task.status === "pending") && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleToggleTaskStatus(task.id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg px-6 py-2.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                          >
                            <div className="flex items-center gap-2">
                              {task.status === "downloading" ? 
                                <Pause className="w-4 h-4" /> : 
                                <Play className="w-4 h-4" />
                              }
                              <span className="font-semibold">
                                {task.status === "downloading" ? '暂停' : '开始'}
                              </span>
                            </div>
                          </Button>
                        )}
                        
                        {/* 删除按钮 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg px-6 py-2.5 transition-all duration-300"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            <span className="font-semibold">删除</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;