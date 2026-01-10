import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Search, Loader2 } from "lucide-react";
import { DownloadType } from "../types";

interface SearchSectionProps {
  activeType: DownloadType;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

const SearchSection = ({ 
  activeType, 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  loading = false 
}: SearchSectionProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const getTypeLabel = (type: DownloadType): string => {
    switch (type) {
      case "music": return "音乐";
      case "video": return "视频";
      case "file": return "文件";
      default: return "资源";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          搜索 {getTypeLabel(activeType)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`搜索 ${getTypeLabel(activeType)}...`}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={onSearch} 
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "搜索中..." : "搜索"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSection;