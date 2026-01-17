import { useEffect, useState } from 'react';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadProgressProps {
  taskId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function DownloadProgress({ taskId, onComplete, onError }: DownloadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('');
  const [status, setStatus] = useState<'downloading' | 'completed' | 'error'>('downloading');
  const [error, setError] = useState('');

  useEffect(() => {
    // 模拟下载进度（等待后端实现真实进度监听）
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('completed');
          onComplete();
          return 100;
        }
        return prev + Math.random() * 5;
      });
      
      setSpeed(`${(Math.random() * 5 + 1).toFixed(1)} MB/s`);
    }, 500);

    return () => clearInterval(interval);
  }, [taskId, onComplete]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <p className="text-green-500 font-medium">下载完成</p>
          <p className="text-green-400/80 text-sm">视频已保存到下载目录</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div>
          <p className="text-red-500 font-medium">下载失败</p>
          <p className="text-red-400/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 w-full max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Download className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-slate-100 font-medium">下载中</p>
          <p className="text-slate-400 text-sm">任务ID: {taskId}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-slate-300">
          <span>进度</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {speed && (
          <p className="text-slate-400 text-sm text-center">
            速度: {speed}
          </p>
        )}
        
        <p className="text-slate-400 text-xs text-center">
          正在下载，请稍候...
        </p>
      </div>
    </div>
  );
}