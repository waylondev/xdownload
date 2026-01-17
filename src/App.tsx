import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Zap, Download, File, Clock } from 'lucide-react';

// 视频格式类型
type VideoFormat = {
  format_id: string;
  ext: string;
  resolution?: string;
  filesize?: number;
  format_note?: string;
};

// 解析结果类型
type ParseResult = {
  title: string;
  duration?: number;
  thumbnail?: string;
  formats: VideoFormat[];
};

// 下载状态类型
type DownloadStatus = 'idle' | 'parsing' | 'ready' | 'downloading' | 'completed' | 'failed';

type DownloadTask = {
  id: string;
  url: string;
  title?: string;
  duration?: number;
  thumbnail?: string;
  formats: VideoFormat[];
  status: DownloadStatus;
  progress: number;
  speed: string;
  error?: string;
};

function App() {
  // 状态
  const [url, setUrl] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [downloadTask, setDownloadTask] = useState<DownloadTask | null>(null);
  const [status, setStatus] = useState<DownloadStatus>('idle');

  // 解析URL
  const handleParseUrl = async () => {
    if (!url.trim()) {
      alert('请输入有效的视频链接');
      return;
    }

    setStatus('parsing');
    
    try {
      // 调用后端解析URL
      const result = await (window as any).__TAURI_INVOKE__('parse_url', { url });
      setParseResult(result);
      setStatus('ready');
      
      // 自动选择最佳格式
      if (result.formats.length > 0) {
        const bestFormat = result.formats.find((f: VideoFormat) => f.format_note?.includes('best')) || 
                          result.formats[0];
        setSelectedFormat(bestFormat.format_id);
      }
    } catch (error) {
      console.error('解析失败:', error);
      alert('解析URL失败，请检查链接是否正确');
      setStatus('idle');
    }
  };

  // 开始下载
  const handleDownload = async () => {
    if (!parseResult || !selectedFormat) {
      alert('请先解析URL并选择下载格式');
      return;
    }

    setStatus('downloading');
    
    try {
      // 调用后端开始下载
      const taskId = await (window as any).__TAURI_INVOKE__('start_download', {
        url,
        format_id: selectedFormat
      });

      // 创建下载任务状态
      const task: DownloadTask = {
        id: taskId,
        url,
        title: parseResult.title,
        duration: parseResult.duration,
        thumbnail: parseResult.thumbnail,
        formats: parseResult.formats,
        status: 'downloading',
        progress: 0,
        speed: '0 KB/s'
      };
      
      setDownloadTask(task);

      // 轮询下载进度
      const progressInterval = setInterval(async () => {
        try {
          const progress = await (window as any).__TAURI_INVOKE__('get_download_progress', { 
            task_id: taskId 
          });
          
          if (progress) {
            setDownloadTask(progress);
            
            if (progress.status === 'completed') {
              clearInterval(progressInterval);
              setStatus('completed');
            } else if (progress.status === 'failed') {
              clearInterval(progressInterval);
              setStatus('failed');
            }
          }
        } catch (error) {
          console.error('获取进度失败:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
      setStatus('ready');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '未知';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // 格式化时长
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '未知';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* 顶部装饰 */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="w-full max-w-2xl space-y-8">
          {/* 标题 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
              XDownload
            </h1>
            <p className="text-slate-400 text-lg">
              基于 yt-dlp 的视频下载工具
            </p>
          </div>
          
          {/* 链接输入区域 */}
          <div className="bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  视频链接
                </label>
                <div className="flex gap-3">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="输入 YouTube、B站、抖音、小红书等视频链接..."
                    className="flex-1 bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 rounded-xl h-12 text-base"
                    disabled={status === 'parsing' || status === 'downloading'}
                  />
                  <Button
                    onClick={handleParseUrl}
                    disabled={status === 'parsing' || status === 'downloading' || !url.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl h-12 px-6 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
                  >
                    {status === 'parsing' ? '解析中...' : '解析'}
                  </Button>
                </div>
              </div>
              
              {/* 解析结果 */}
              {parseResult && status === 'ready' && (
                <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-start gap-4">
                    {parseResult.thumbnail && (
                      <img 
                        src={parseResult.thumbnail} 
                        alt="缩略图"
                        className="w-24 h-16 object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
                        {parseResult.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(parseResult.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <File className="w-4 h-4" />
                          <span>{parseResult.formats.length} 个格式</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 格式选择 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      选择下载格式：
                    </label>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {parseResult.formats.map((format) => (
                        <label key={format.format_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="format"
                            value={format.format_id}
                            checked={selectedFormat === format.format_id}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="text-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-slate-100">
                              {format.format_note || format.ext.toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-400">
                              {format.resolution && `${format.resolution} • `}
                              {formatFileSize(format.filesize)}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 rounded-xl h-12 transition-all duration-300 shadow-lg hover:shadow-green-500/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    开始下载
                  </Button>
                </div>
              )}
              
              {/* 下载进度 */}
              {downloadTask && (status === 'downloading' || status === 'completed' || status === 'failed') && (
                <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'downloading' ? 'bg-blue-500 animate-pulse' :
                      status === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-100 font-medium truncate">
                        {downloadTask.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {status === 'downloading' ? `下载中... ${downloadTask.speed}` :
                         status === 'completed' ? '下载完成' :
                         `下载失败: ${downloadTask.error}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">下载进度</span>
                      <span className="text-blue-400">{downloadTask.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800/90 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
                        style={{ width: `${downloadTask.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 支持的网站 */}
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">
              支持的网站：
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['YouTube', 'B站', '抖音', '小红书', '微博', '西瓜视频', '腾讯视频', '爱奇艺'].map((site) => (
                <span 
                  key={site} 
                  className="text-xs px-2 py-1 bg-slate-800/90 rounded-full text-slate-300 whitespace-nowrap"
                >
                  {site}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;