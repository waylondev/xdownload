import { useState } from 'react';
import { useAppStore } from './stores/appStore';
import { useSearch, usePlatforms, useTasks, useDownload } from './hooks/api';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import TaskList from './components/TaskList';
import { Music, Film, FileText, Menu, X, Github } from 'lucide-react';

function App() {
  // 状态
  const { searchQuery, activeType, selectedPlatform, setSearchQuery, setActiveType, setSelectedPlatform } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // API调用
  const { mutate: search, isPending: searchLoading } = useSearch();
  const { data: platforms = [] } = usePlatforms();
  const { data: tasks = [] } = useTasks(activeType);
  const { mutate: download } = useDownload();

  // 搜索处理
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    search({
      query: searchQuery,
      fileType: activeType,
      platform: selectedPlatform || 'all',
      page: 1,
      pageSize: 20
    });
  };

  // 下载处理
  const handleDownload = (item: any) => {
    download({
      url: item.url,
      filename: item.title,
      type: activeType,
      platform: selectedPlatform || 'all'
    });
  };

  // 类型切换处理
  const handleTypeChange = (type: 'music' | 'video' | 'file') => {
    setActiveType(type);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* 左侧可收缩Sidebar */}
      <aside 
        className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}
      >
        {/* Logo区域 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className={`text-xl font-bold text-blue-400 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            XDownload
          </h1>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 space-y-2">
          <div className={`text-xs uppercase text-slate-500 mb-2 font-semibold transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            内容类型
          </div>
          
          {/* 音乐选项 */}
          <button
            onClick={() => handleTypeChange('music')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeType === 'music' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
          >
            <Music className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              音乐
            </span>
          </button>

          {/* 视频选项 */}
          <button
            onClick={() => handleTypeChange('video')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeType === 'video' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
          >
            <Film className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              视频
            </span>
          </button>

          {/* 文件选项 */}
          <button
            onClick={() => handleTypeChange('file')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeType === 'file' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
          >
            <FileText className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              文件
            </span>
          </button>
        </nav>

        {/* Github地址 - 左下角 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Github className="w-5 h-5 text-slate-400" />
            <span className={`text-xs text-slate-400 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              GitHub
            </span>
          </a>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        <div className="container mx-auto p-6 space-y-6">
          {/* 搜索区域 */}
          <SearchBar
            searchQuery={searchQuery}
            activeType={activeType}
            selectedPlatform={selectedPlatform}
            platforms={platforms}
            onSearchQueryChange={setSearchQuery}
            onTypeChange={setActiveType}
            onPlatformChange={setSelectedPlatform}
            onSearch={handleSearch}
            loading={searchLoading}
          />
          
          {/* 搜索结果 */}
          <ResultsList
            onDownload={handleDownload}
          />
          
          {/* 下载任务列表 */}
          <div className="mt-8">
            <TaskList tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;