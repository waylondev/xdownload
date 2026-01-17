import { useState, useEffect } from 'react';
import { invoke, event } from '@tauri-apps/api';

function App() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 监听终端输出事件
  useEffect(() => {
    const setupEventListener = async () => {
      try {
        const unlisten = await event.listen('terminal-output', (event) => {
          setOutput(prev => [...prev, event.payload as string]);
        });

        return unlisten;
      } catch (error) {
        console.error('设置事件监听失败:', error);
      }
    };

    setupEventListener();
  }, []);

  // 执行命令
  const executeCommand = async () => {
    if (!command.trim()) return;
    
    setIsRunning(true);
    setOutput(prev => [...prev, `$ ${command}`]);
    
    try {
      await invoke('run_yt_dlp_command', { command });
      setOutput(prev => [...prev, '命令执行完成']);
    } catch (error) {
      setOutput(prev => [...prev, `错误: ${error}`]);
    } finally {
      setIsRunning(false);
    }
  };

  // 清空输出
  const clearOutput = () => {
    setOutput([]);
  };

  // 复制命令
  const copyCommand = () => {
    navigator.clipboard.writeText(command);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              XDownload
            </h1>
          </div>
          <p className="text-gray-400 text-lg">可视化下载工具</p>
          <p className="text-gray-500 text-sm mt-1">基于 yt-dlp 引擎</p>
        </div>

        {/* 命令输入区域 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="输入 yt-dlp 命令，例如: yt-dlp https://www.youtube.com/watch?v=xxx"
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                disabled={isRunning}
              />
              {command && (
                <button
                  onClick={copyCommand}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  title="复制命令"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={executeCommand}
              disabled={isRunning || !command.trim()}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  执行中
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  执行
                </>
              )}
            </button>
            <button
              onClick={clearOutput}
              className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空
            </button>
          </div>
          
          {/* 快捷命令提示 */}
          <div className="text-sm text-gray-400">
            <span className="font-medium">快捷命令:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'yt-dlp https://www.youtube.com/watch?v=xxx',
                'yt-dlp -f best https://bilibili.com/video/xxx',
                'yt-dlp --extract-audio --audio-format mp3',
                'yt-dlp --write-thumbnail --embed-thumbnail'
              ].map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => setCommand(cmd)}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-xs transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 终端输出区域 */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">终端输出</span>
            <div className="flex items-center gap-2">
              {isRunning && (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">执行中</span>
                </div>
              )}
              <span className="text-xs text-gray-500">{output.length} 行</span>
            </div>
          </div>
          
          <div className="h-96 overflow-auto p-4 font-mono text-sm">
            {output.length === 0 ? (
              <div className="text-gray-500 text-center py-16">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>终端输出将显示在这里</p>
                <p className="text-xs mt-1">输入命令并点击执行开始使用</p>
              </div>
            ) : (
              output.map((line, index) => (
                <div key={index} className="mb-1 leading-relaxed">
                  {line.startsWith('$ ') ? (
                    <span className="text-green-400 font-medium">{line}</span>
                  ) : line.includes('错误') || line.toLowerCase().includes('error') ? (
                    <span className="text-red-400">{line}</span>
                  ) : line.includes('完成') || line.toLowerCase().includes('success') ? (
                    <span className="text-green-400">{line}</span>
                  ) : line.includes('下载') || line.toLowerCase().includes('download') ? (
                    <span className="text-blue-400">{line}</span>
                  ) : (
                    <span className="text-gray-300">{line}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <div className="flex justify-center gap-8 mb-3">
            <a 
              href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              支持站点
            </a>
            <a 
              href="https://github.com/waylondev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              作者
            </a>
            <a 
              href="https://github.com/waylondev/xdownload" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
          <p>XDownload - 基于 yt-dlp 引擎的可视化下载工具</p>
        </div>
      </div>
    </div>
  );
}

export default App;