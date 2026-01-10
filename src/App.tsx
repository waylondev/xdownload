import React from 'react';
import ModernLayout from './components/ModernLayout';
import TaskList from './components/TaskList';

// Zustand状态管理
import {
  useSearchQuery,
  useSearchResults,
  useSelectedResults,
  usePagination,
  useActiveType,
  useSelectedPlatform,
  useTasks,
  useLoading,
  useError,
  useSearchActions,
  usePlatforms,
  useDownloadActions,
} from './stores/appStore';

// 业务逻辑Hook
import { useAppLogic } from './hooks/useAppLogic';

function App() {
  // 本地状态
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Zustand状态选择器
  const searchQuery = useSearchQuery();
  const searchResults = useSearchResults();
  const activeType = useActiveType();
  const selectedPlatform = useSelectedPlatform();
  const tasks = useTasks();
  const loading = useLoading();
  const error = useError();
  const availablePlatforms = usePlatforms();

  // Zustand操作
  const searchActions = useSearchActions();
  const downloadActions = useDownloadActions();


  // 业务逻辑
  const {
    loadTasks,
    handleSearch,
    handleDownload,
    handleBatchDownload,
    handlePageChange,
    handlePlatformChange,
    handleTypeChange,
    getAvailablePlatforms
  } = useAppLogic();

  // 初始化加载任务和平台数据
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // 加载平台数据
        const platforms = await getAvailablePlatforms();
        if (platforms && platforms.length > 0) {
          downloadActions.setPlatforms(platforms);
        } else {
          // 如果后端没有返回平台数据，使用默认数据
          const defaultPlatforms = [
            { id: 'youtube', name: 'YouTube', icon: '▶️', supportedTypes: ['video', 'music'] },
            { id: 'bilibili', name: 'Bilibili', icon: '📺', supportedTypes: ['video'] },
            { id: 'netease', name: '网易云音乐', icon: '🎵', supportedTypes: ['music'] },
            { id: 'qqmusic', name: 'QQ音乐', icon: '🎶', supportedTypes: ['music'] },
            { id: 'github', name: 'GitHub', icon: '💻', supportedTypes: ['file'] },
          ];
          downloadActions.setPlatforms(defaultPlatforms);
        }
        
        // 加载任务
        loadTasks(activeType);
      } catch (error) {
        console.error('初始化应用失败:', error);
      }
    };

    initializeApp();
  }, [activeType, loadTasks, getAvailablePlatforms, downloadActions]);

  // 搜索处理
  const onSearch = () => {
    handleSearch(searchQuery, activeType);
  };

  // 侧边栏切换
  const onToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 平台切换
  const onPlatformChange = (platform: string) => {
    handlePlatformChange(platform);
  };

  // 下载类型切换
  const onTypeChange = (type: any) => {
    handleTypeChange(type);
  };

  // 刷新任务列表
  const onRefreshTasks = () => {
    loadTasks(activeType);
  };

  return (
    <div className="min-h-screen">
      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* 现代布局 */}
      <ModernLayout
        activeType={activeType}
        selectedPlatform={selectedPlatform}
        searchQuery={searchQuery}
        searchResults={searchResults}
        availablePlatforms={availablePlatforms}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onTypeChange={onTypeChange}
        onPlatformChange={onPlatformChange}
        onSearchQueryChange={searchActions.setSearchQuery}
        onSearch={onSearch}
        onDownload={(item) => handleDownload(item, activeType)}
        onToggleSidebar={onToggleSidebar}
      />
      
      {/* 任务列表 */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6`}>
        <TaskList 
          tasks={tasks}
          onRefresh={onRefreshTasks}
        />
      </div>
    </div>
  );
}

export default App;