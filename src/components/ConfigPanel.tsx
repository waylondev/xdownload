import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Save, Folder } from 'lucide-react';

// 配置类型
type AppConfig = {
  yt_dlp_path: string;
  download_path: string;
  max_concurrent_downloads: number;
};

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const [config, setConfig] = useState<AppConfig>({
    yt_dlp_path: '../bin/yt-dlp.exe',
    download_path: '../downloads',
    max_concurrent_downloads: 3
  });
  const [isLoading, setIsLoading] = useState(false);

  // 加载配置
  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const currentConfig = await invoke('get_config');
      if (currentConfig) {
        setConfig(currentConfig);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_config', {
        config
      });
      onClose();
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存配置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFolder = async (field: keyof AppConfig) => {
    try {
      const { open } = await import('@tauri-apps/api/dialog');
      const selected = await open({
        directory: true,
        multiple: false
      });
      
      if (selected && !Array.isArray(selected)) {
        setConfig(prev => ({ ...prev, [field]: selected }));
      }
    } catch (error) {
      console.error('选择文件夹失败:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-slate-100">应用配置</h2>
        </div>

        <div className="space-y-4">
          {/* yt-dlp路径 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              yt-dlp.exe 路径
            </label>
            <div className="flex gap-2">
              <Input
                value={config.yt_dlp_path}
                onChange={(e) => setConfig(prev => ({ ...prev, yt_dlp_path: e.target.value }))}
                placeholder="yt-dlp.exe 路径"
                className="flex-1 bg-slate-800 border-slate-700 text-slate-100"
              />
              <Button
                onClick={() => selectFolder('yt_dlp_path')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <Folder className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 下载路径 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              下载保存路径
            </label>
            <div className="flex gap-2">
              <Input
                value={config.download_path}
                onChange={(e) => setConfig(prev => ({ ...prev, download_path: e.target.value }))}
                placeholder="下载保存路径"
                className="flex-1 bg-slate-800 border-slate-700 text-slate-100"
              />
              <Button
                onClick={() => selectFolder('download_path')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <Folder className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 并发下载数 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最大并发下载数
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={config.max_concurrent_downloads}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                max_concurrent_downloads: parseInt(e.target.value) || 1 
              }))}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600"
          >
            取消
          </Button>
          <Button
            onClick={saveConfig}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  );
}