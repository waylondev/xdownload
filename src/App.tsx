import { useState, useEffect, useRef } from 'react';
import { useAppStore } from './stores/appStore';
import { useSearch, usePlatforms, useTasks, useDownload } from './hooks/api';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import TaskList from './components/TaskList';
import { Music, Film, FileText, ChevronLeft, ChevronRight, Github, Zap, Database, Settings, Info } from 'lucide-react';

function App() {
  // 状态
  const { searchQuery, activeType, selectedPlatform, setSearchQuery, setActiveType, setSelectedPlatform } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // 响应式设计：根据屏幕宽度自动调整侧边栏
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      // 当屏幕宽度小于1024px时，自动收起侧边栏
      if (screenWidth < 1024 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      } else if (screenWidth >= 1024 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);
  
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
        ref={sidebarRef}
        className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-10 overflow-hidden`}
        style={{ 
          width: sidebarCollapsed ? '3.5rem' : '14rem',
          minWidth: '3.5rem',
          maxWidth: '14rem',
          flexShrink: 0
        }}
      >
        {/* Logo区域 */}
        <div className={`flex items-center justify-center ${sidebarCollapsed ? 'p-4' : 'p-4 border-b border-slate-800'}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 w-full">
              <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                XDownload
              </h1>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 text-blue-400" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-blue-400" />
            </button>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
          {/* 主要导航标题 - 仅在展开时显示 */}
          {!sidebarCollapsed && (
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold px-3 mt-1">
              内容类型
            </div>
          )}
          
          {/* 音乐选项 */}
          <button
            onClick={() => handleTypeChange('music')}
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} ${activeType === 'music' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${activeType === 'music' ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300'}`}>
              <Music className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              音乐
            </span>
          </button>

          {/* 视频选项 */}
          <button
            onClick={() => handleTypeChange('video')}
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} ${activeType === 'video' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${activeType === 'video' ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300'}`}>
              <Film className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              视频
            </span>
          </button>

          {/* 文件选项 */}
          <button
            onClick={() => handleTypeChange('file')}
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} ${activeType === 'file' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${activeType === 'file' ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              文件
            </span>
          </button>

          {/* 分隔线 */}
          <div className="h-px bg-slate-800 my-3 opacity-70"></div>

          {/* 次级导航标题 - 仅在展开时显示 */}
          {!sidebarCollapsed && (
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold px-3">
              系统
            </div>
          )}

          {/* 数据管理 */}
          <button
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} hover:bg-slate-800`}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300">
              <Database className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              数据管理
            </span>
          </button>

          {/* 设置 */}
          <button
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} hover:bg-slate-800`}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300">
              <Settings className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              设置
            </span>
          </button>

          {/* 关于 */}
          <button
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} hover:bg-slate-800`}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-blue-300">
              <Info className="w-5 h-5" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
              关于
            </span>
          </button>
        </nav>

        {/* Github地址 */}
        <div className="p-2 border-t border-slate-800">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'} bg-slate-800 hover:bg-slate-700`}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-900 text-slate-400 hover:text-blue-300">
              <Github className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 whitespace-nowrap'}`}>
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