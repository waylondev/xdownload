import { Music, Film, FileText, Search, Loader2 } from 'lucide-react';
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
  onPlatformChange,
  onSearch,
  loading
}: Omit<SearchBarProps, 'onTypeChange'>) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="w-full">
      {/* 搜索区域 */}
      <div className="flex flex-col gap-4">
        {/* 搜索表单 */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* 平台选择 */}
          <div className="w-full md:w-48">
            <Select value={selectedPlatform} onValueChange={onPlatformChange}>
              <SelectTrigger className="w-full bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 hover:bg-slate-700/90 transition-all duration-300 rounded-2xl h-12 text-base shadow-lg hover:shadow-blue-500/20">
                <SelectValue placeholder="选择平台" className="text-slate-300" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-slate-100 rounded-xl shadow-2xl overflow-hidden">
                <SelectItem value="all" className="hover:bg-slate-800 transition-all duration-200 p-3 text-base">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Search className="w-4 h-4 text-blue-400" />
                    </div>
                    <span>全部平台</span>
                  </div>
                </SelectItem>
                {platforms.map((platform) => (
                  <SelectItem 
                    key={platform.id} 
                    value={platform.id} 
                    className="hover:bg-slate-800 transition-all duration-200 p-3 text-base"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-400">{platform.name.charAt(0)}</span>
                      </div>
                      <span>{platform.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 搜索输入和按钮 */}
          <div className="flex-1 flex gap-3">
            {/* 搜索输入 */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <Input
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`搜索${downloadTypes.find(t => t.id === activeType)?.name}...`}
                className="w-full bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 rounded-2xl h-12 text-base shadow-lg hover:shadow-blue-500/20 pl-5 pr-12"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* 搜索按钮 */}
            <Button 
              onClick={onSearch} 
              disabled={loading || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl h-12 px-6 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 group"
            >
              <div className="flex items-center gap-3">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                )}
                <span className="font-semibold">
                  {loading ? '搜索中...' : '搜索'}
                </span>
              </div>
            </Button>
          </div>
        </div>

        {/* 搜索提示 */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Search className="w-4 h-4" />
          <span>支持音乐、视频、文件搜索，输入关键词即可开始</span>
        </div>
      </div>
    </div>
  );
}