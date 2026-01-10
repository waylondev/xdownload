import { DownloadType } from "../types";
import { Music, Film, FileText } from "lucide-react";

interface DownloadTypeConfig {
  id: DownloadType;
  name: string;
  icon: string;
}

interface DownloadTypeNavProps {
  activeType: DownloadType;
  onTypeChange: (type: DownloadType) => void;
}

const DownloadTypeNav = ({ activeType, onTypeChange }: DownloadTypeNavProps) => {
  // 下载类型配置
  const downloadTypes: DownloadTypeConfig[] = [
    { id: "music", name: "音乐", icon: Music.name },
    { id: "video", name: "视频", icon: Film.name },
    { id: "file", name: "文件", icon: FileText.name },
  ];

  // 根据图标名称获取图标组件
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case Music.name:
        return <Music className="w-5 h-5" />;
      case Film.name:
        return <Film className="w-5 h-5" />;
      case FileText.name:
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <nav className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {downloadTypes.map((type) => (
        <button
          key={type.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeType === type.id 
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`}
          onClick={() => onTypeChange(type.id)}
        >
          {getIcon(type.icon)}
          <span>{type.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default DownloadTypeNav;
