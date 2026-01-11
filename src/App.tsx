import { useState } from 'react';
import { useAppStore } from './stores/appStore';
import { useSearch, usePlatforms, useTasks, useDownload } from './hooks/api';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import TaskList from './components/TaskList';
import { Music, Film, FileText, Menu, X, Github, Zap, Database, Settings, Info } from 'lucide-react';

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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
      {/* 左侧可收缩Sidebar */}
      <aside 
        className={`bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-72'} flex flex-col shadow-2xl z-10 overflow-hidden`}
      >
        {/* Logo区域 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {/* Logo和标题 */}
          <div className={`flex items-center gap-3 transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              XDownload
            </h1>
          </div>
          
          {/* 折叠按钮 - 确保始终可见可点击 */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-all duration-300 hover:scale-110 flex-shrink-0 z-20"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5 text-blue-400" /> : <X className="w-5 h-5 text-blue-400" />}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {/* 主要导航 */}
          <div className={`text-xs uppercase text-slate-500 mb-4 font-semibold px-3 transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            内容类型
          </div>
          
          {/* 音乐选项 */}
          <button
            onClick={() => handleTypeChange('music')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 ${activeType === 'music' ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/30 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/15' : 'hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden ${activeType === 'music' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/40 shadow-md shadow-blue-500/20' : 'bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Music className={`w-6 h-6 relative z-10 transition-all duration-350 ${activeType === 'music' ? 'text-blue-400 animate-pulse' : 'text-slate-400 hover:text-blue-300'}`} />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              音乐
            </span>
          </button>

          {/* 视频选项 */}
          <button
            onClick={() => handleTypeChange('video')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 ${activeType === 'video' ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/30 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/15' : 'hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden ${activeType === 'video' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/40 shadow-md shadow-blue-500/20' : 'bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Film className={`w-6 h-6 relative z-10 transition-all duration-350 ${activeType === 'video' ? 'text-blue-400 animate-pulse' : 'text-slate-400 hover:text-blue-300'}`} />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              视频
            </span>
          </button>

          {/* 文件选项 */}
          <button
            onClick={() => handleTypeChange('file')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 ${activeType === 'file' ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/30 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/15' : 'hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden ${activeType === 'file' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/40 shadow-md shadow-blue-500/20' : 'bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <FileText className={`w-6 h-6 relative z-10 transition-all duration-350 ${activeType === 'file' ? 'text-blue-400 animate-pulse' : 'text-slate-400 hover:text-blue-300'}`} />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              文件
            </span>
          </button>

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-5 opacity-70"></div>

          {/* 次级导航 */}
          <div className={`text-xs uppercase text-slate-500 mb-4 font-semibold px-3 transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            系统
          </div>

          {/* 数据管理 */}
          <button
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Database className="w-6 h-6 relative z-10 text-slate-400 hover:text-blue-300 transition-colors" />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              数据管理
            </span>
          </button>

          {/* 设置 */}
          <button
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Settings className="w-6 h-6 relative z-10 text-slate-400 hover:text-blue-300 transition-colors" />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              设置
            </span>
          </button>

          {/* 关于 */}
          <button
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-350 hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent hover:shadow-lg hover:shadow-slate-700/10`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Info className="w-6 h-6 relative z-10 text-slate-400 hover:text-blue-300 transition-colors" />
            </div>
            <span className={`transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              关于
            </span>
          </button>
        </nav>

        {/* Github地址 - 左下角 */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex justify-center">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 justify-center p-3 rounded-xl transition-all duration-350 bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/15 w-full"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 relative overflow-hidden bg-slate-800/90 border border-slate-700/30 hover:bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:border-blue-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 opacity-80"></div>
              <Github className="w-6 h-6 relative z-10 text-slate-400 hover:text-blue-300 transition-colors" />
            </div>
            <span className={`text-sm font-medium text-slate-400 hover:text-blue-300 transition-all duration-500 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              GitHub
            </span>
          </a>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* 顶部装饰 */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto p-8 space-y-8">
          {/* 页面标题 */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20`}>
              {activeType === 'music' && <Music className="w-6 h-6 text-white" />}
              {activeType === 'video' && <Film className="w-6 h-6 text-white" />}
              {activeType === 'file' && <FileText className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              {activeType === 'music' && '音乐'}
              {activeType === 'video' && '视频'}
              {activeType === 'file' && '文件'}
            </h2>
          </div>
          
          {/* 搜索区域 */}
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <SearchBar
              searchQuery={searchQuery}
              activeType={activeType}
              selectedPlatform={selectedPlatform}
              platforms={platforms}
              onSearchQueryChange={setSearchQuery}
              onPlatformChange={setSelectedPlatform}
              onSearch={handleSearch}
              loading={searchLoading}
            />
          </div>
          
          {/* 搜索结果 */}
          <ResultsList
            onDownload={handleDownload}
          />
          
          {/* 下载任务列表 */}
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <TaskList tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;