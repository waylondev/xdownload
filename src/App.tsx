import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Header } from './components/Header';
import { CommandInput } from './components/CommandInput';
import { DownloadLog } from './components/DownloadLog';
import { Footer } from './components/Footer';

function App() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 监听终端输出事件
  useEffect(() => {
    const setupEventListener = async () => {
      try {
        const unlisten = await listen('terminal-output', (event) => {
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
    setOutput(prev => [...prev, `${command}`]);
    
    try {
      await invoke('execute_command', { request: { command } });
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header isRunning={isRunning} />
        
        <CommandInput
          command={command}
          isRunning={isRunning}
          onCommandChange={setCommand}
          onExecute={executeCommand}
          onCopyCommand={copyCommand}
        />
        
        <DownloadLog
          output={output}
          onClearOutput={clearOutput}
        />
        
        <Footer />
      </div>
    </div>
  );
}

export default App;