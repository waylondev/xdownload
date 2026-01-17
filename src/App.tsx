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
      await invoke('execute_command', { command });
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

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <main className="flex-1 flex flex-col p-4">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">yt-dlp 可视化终端</h1>
          <p className="text-slate-400">直接输入yt-dlp命令，实时查看输出</p>
        </div>

        {/* 命令输入区 */}
        <div className="flex gap-2 mb-4">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="输入yt-dlp命令，例如: yt-dlp https://www.youtube.com/watch?v=xxx"
            className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            disabled={isRunning}
          />
          <button
            onClick={executeCommand}
            disabled={isRunning || !command.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium"
          >
            {isRunning ? '执行中...' : '执行'}
          </button>
          <button
            onClick={clearOutput}
            className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg"
          >
            清空
          </button>
        </div>

        {/* 终端输出区 */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm overflow-auto">
          {output.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              终端输出将显示在这里
            </div>
          ) : (
            output.map((line, index) => (
              <div key={index} className="mb-1">
                {line.startsWith('$ ') ? (
                  <span className="text-green-400">{line}</span>
                ) : line.includes('错误') || line.includes('error') ? (
                  <span className="text-red-400">{line}</span>
                ) : line.includes('完成') || line.includes('success') ? (
                  <span className="text-green-400">{line}</span>
                ) : (
                  <span className="text-slate-300">{line}</span>
                )}
              </div>
            ))
          )}
          
          {isRunning && (
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>命令执行中...</span>
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-4 text-slate-400 text-sm">
          <p><strong>使用示例:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>yt-dlp https://www.youtube.com/watch?v=xxx</li>
            <li>yt-dlp -f best https://bilibili.com/video/xxx</li>
            <li>yt-dlp --extract-audio --audio-format mp3 https://example.com</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;