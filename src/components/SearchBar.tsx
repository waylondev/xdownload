import { Music, Film, FileText, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchBarProps {
  searchQuery: string;
  activeType: 'music' | 'video' | 'file';
  selectedPlatform: string;
  platforms: any[];
  onSearchQueryChange: (query: string) => void;
  onTypeChange: (type: 'music' | 'video' | 'file') => void;
  onPlatformChange: (platform: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const downloadTypes = [
  { id: 'music' as const, name: '音乐', icon: Music, color: 'text-pink-500' },
  { id: 'video' as const, name: '视频', icon: Film, color: 'text-blue-500' },
  { id: 'file' as const, name: '文件', icon: FileText, color: 'text-green-500' },
];

export function SearchBar({
  searchQuery,
  activeType,
  selectedPlatform,
  platforms,
  onSearchQueryChange,
  onTypeChange,
  onPlatformChange,
  onSearch,
  loading
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="space-y-6">
      {/* 下载类型选择 */}
      <div className="flex space-x-2">
        {downloadTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={activeType === type.id ? 'default' : 'outline'}
              onClick={() => onTypeChange(type.id)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {type.name}
            </Button>
          );
        })}
      </div>

      {/* 搜索区域 */}
      <div className="flex space-x-3">
        {/* 平台选择 */}
        <Select value={selectedPlatform} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="选择平台" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部平台</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 搜索输入 */}
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`搜索${downloadTypes.find(t => t.id === activeType)?.name}...`}
          className="flex-1"
        />

        {/* 搜索按钮 */}
        <Button onClick={onSearch} disabled={loading || !searchQuery.trim()}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>
    </div>
  );
}