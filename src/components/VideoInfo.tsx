import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface VideoInfoProps {
  parseResult: any;
  onDownload: () => void;
  isDownloading: boolean;
}

export function VideoInfo({ parseResult, onDownload, isDownloading }: VideoInfoProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
      <div className="flex gap-4 mb-6">
        {parseResult.thumbnail && (
          <img 
            src={parseResult.thumbnail} 
            alt="视频缩略图"
            className="w-32 h-18 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
            {parseResult.title}
          </h3>
          {parseResult.duration && (
            <p className="text-slate-400 text-sm">
              时长: {Math.floor(parseResult.duration / 60)}:{String(Math.floor(parseResult.duration % 60)).padStart(2, '0')}
            </p>
          )}
          <p className="text-slate-400 text-sm mt-1">
            可用格式: {parseResult.formats.length} 种
          </p>
        </div>
      </div>
      
      <Button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
      >
        <Download className="w-4 h-4 mr-2" />
        {isDownloading ? '下载中...' : '下载视频 (智能选择最佳格式)'}
      </Button>
      <p className="text-slate-400 text-xs text-center mt-2">
        yt-dlp将自动选择最佳音视频质量
      </p>
    </div>
  );
}