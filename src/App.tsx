import React from 'react';
import ModernLayout from './components/ModernLayout';
import TaskList from './components/TaskList';

// Zustand状态管理
import {
  useSearchQuery,
  useSearchResults,
  useActiveType,
  useSelectedPlatform,
  useTasks,
  useLoading,
  useError,
  useSearchActions,
  usePlatforms,
  useDownloadActions,
} from './stores/appStore';

// TanStack Query
import { useSearchQuery as useSearchQueryHook, usePlatformsQuery, useTasksQuery, useStartDownloadMutation } from './hooks/useReactQuery';

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

  // TanStack Query数据加载
  const { data: platformsData } = usePlatformsQuery();
  const { data: tasksData } = useTasksQuery(activeType);
  const { mutate: startDownload } = useStartDownloadMutation();

  // 当平台数据加载完成时，更新状态
  React.useEffect(() => {
    if (platformsData && platformsData.length > 0) {
      downloadActions.setPlatforms(platformsData);
    }
  }, [platformsData, downloadActions]);

  // 当任务数据加载完成时，更新状态
  React.useEffect(() => {
    if (tasksData) {
      downloadActions.setTasks(tasksData);
    }
  }, [tasksData, downloadActions]);

  // 搜索处理 - 直接使用TanStack Query
  const onSearch = () => {
    if (!searchQuery.trim()) return;
    
    // 使用TanStack Query进行搜索
    const { data, isLoading, error } = useSearchQueryHook(
      searchQuery, 
      activeType, 
      selectedPlatform || 'all', 
      1
    );

    // 更新状态
    if (isLoading) {
      // 使用全局loading状态
    } else {
      // 使用全局loading状态
    }

    if (error) {
      // 使用全局error状态
      searchActions.setSearchResults([]);
    }

    if (data) {
      // 假设data是SearchResult[]数组
      searchActions.setSearchResults(data as any);
      searchActions.setTotalPages(1);
      // 使用全局error状态
    }
  };

  // 侧边栏切换
  const onToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 平台切换
  const onPlatformChange = (platform: string) => {
    downloadActions.setSelectedPlatform(platform);
    searchActions.clearSearch();
  };

  // 下载类型切换
  const onTypeChange = (type: any) => {
    downloadActions.setActiveType(type);
  };

  // 下载处理
  const onDownload = (item: any) => {
    startDownload({
      url: item.url,
      filename: item.title,
      type: activeType,
      platform: item.platform || selectedPlatform
    });
  };

  // 批量下载
  const onBatchDownload = (selectedResults: string[]) => {
    selectedResults.forEach(resultId => {
      const item = searchResults.find(r => r.id === resultId);
      if (item) {
        onDownload(item);
      }
    });
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
        onDownload={onDownload}
        onBatchDownload={onBatchDownload}
        onToggleSidebar={onToggleSidebar}
      />
      
      {/* 任务列表 */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6`}>
        <TaskList 
          tasks={tasks}
        />
      </div>
    </div>
  );
}

export default App;