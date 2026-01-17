import { Button } from './ui/button';
import { Input } from './ui/input';
import { Zap, Settings } from 'lucide-react';

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onParse: () => void;
  onOpenConfig: () => void;
  isLoading: boolean;
}

export function UrlInput({ url, setUrl, onParse, onOpenConfig, isLoading }: UrlInputProps) {
  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* 配置按钮 */}
      <Button
        onClick={onOpenConfig}
        className="absolute top-4 right-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700"
        size="sm"
      >
        <Settings className="w-4 h-4" />
      </Button>
      
      {/* 标题 */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          XDownload
        </h1>
        <p className="text-slate-400 text-lg">
          智能视频下载工具
        </p>
      </div>

      {/* URL输入框 */}
      <div className="flex gap-3">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入视频URL (YouTube, Bilibili, TikTok等)"
          className="flex-1 bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-100 placeholder-slate-500"
          onKeyPress={(e) => e.key === 'Enter' && onParse()}
        />
        <Button
          onClick={onParse}
          disabled={isLoading || !url.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isLoading ? '解析中...' : '解析URL'}
        </Button>
      </div>
    </div>
  );
}