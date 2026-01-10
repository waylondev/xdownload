import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { DownloadType } from "../types";
import { PlatformInfo } from "../types/unified-interface";
import { IpcSearchService } from "../services/IpcSearchService";
import { useState, useEffect } from "react";

// 创建服务实例
const searchService = new IpcSearchService();

interface PlatformSelectorProps {
  activeType: DownloadType;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  className?: string;
}

const PlatformSelector = ({
  activeType,
  selectedPlatform,
  onPlatformChange,
  className
}: PlatformSelectorProps) => {
  const [availablePlatforms, setAvailablePlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // 将DownloadType映射到FileType
  const mapDownloadTypeToFileType = (type: DownloadType): any => {
    switch (type) {
      case "music": return "audio";
      case "video": return "video";
      case "file": return "document";
      default: return "other";
    }
  };

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setLoading(true);
        const fileType = mapDownloadTypeToFileType(activeType);
        const platforms = await searchService.getPlatformsByFileType(fileType);
        setAvailablePlatforms(platforms);
      } catch (error) {
        console.error("加载平台数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlatforms();
  }, [activeType]);

  const getTypeLabel = (type: DownloadType): string => {
    switch (type) {
      case "music": return "音乐";
      case "video": return "视频";
      case "file": return "文件";
      default: return "资源";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            加载平台数据中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">📡</span>
          选择{getTypeLabel(activeType)}平台
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* 全部平台选项 */}
          <Badge
            key="all"
            variant={selectedPlatform === "all" ? "default" : "outline"}
            className={`
              cursor-pointer px-3 py-1.5 text-sm transition-all
              ${selectedPlatform === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
            onClick={() => onPlatformChange("all")}
          >
            🌐 全部平台
          </Badge>
          
          {availablePlatforms.map((platform) => (
            <Badge
              key={platform.id}
              variant={selectedPlatform === platform.id ? "default" : "outline"}
              className={`
                cursor-pointer px-3 py-1.5 text-sm transition-all
                ${selectedPlatform === platform.id 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              onClick={() => onPlatformChange(platform.id)}
            >
              {platform.icon} {platform.name}
            </Badge>
          ))}
        </div>
        
        {/* 平台描述 */}
        {selectedPlatform !== "all" && (
          <div className="mt-3 text-sm text-gray-600">
            {availablePlatforms.find(p => p.id === selectedPlatform)?.description || "选择平台开始搜索"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformSelector;