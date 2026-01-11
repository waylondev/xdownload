import React from 'react';
import ModernLayout from './components/ModernLayout';
import TaskList from './components/TaskList';

// 状态管理
import {
  useSearchQuery,
  useSearchResults,
  useActiveType,
  useSelectedPlatform,
  useTasks,
  useSearchActions,
  useDownloadActions,
} from './stores/appStore';

// TanStack Query
import { useSearchQuery as useSearchQueryHook, usePlatformsQuery, useTasksQuery, useStartDownloadMutation } from './hooks/useReactQuery';

function App() {
  // 本地状态
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Zustand状态
  const searchQuery = useSearchQuery();
  const searchResults = useSearchResults();
  const activeType = useActiveType();
  const selectedPlatform = useSelectedPlatform();
  const tasks = useTasks();

  // Zustand操作
  const searchActions = useSearchActions();
  const downloadActions = useDownloadActions();

  // TanStack Query数据加载
  const { data: platformsData } = usePlatformsQuery();
  const { data: tasksData } = useTasksQuery(activeType);
  const { mutate: startDownload } = useStartDownloadMutation();
  
  // 搜索查询
  const { 
    data: searchData, 
    error: searchError,
    refetch: refetchSearch
  } = useSearchQueryHook(
    searchQuery, 
    activeType, 
    selectedPlatform || 'all', 
    1
  );

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

  // 当搜索数据变化时更新状态
  React.useEffect(() => {
    if (searchError) {
      searchActions.setError(searchError instanceof Error ? searchError.message : '搜索失败');
      searchActions.setSearchResults([]);
    } else if (searchData) {
      // 假设searchData是SearchResult[]数组
      searchActions.setSearchResults(searchData as any);
      searchActions.setTotalPages(1);
      searchActions.setError(null);
    }
  }, [searchData, searchError, searchActions]);

  // 搜索处理
  const onSearch = () => {
    if (!searchQuery.trim()) return;
    refetchSearch();
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
      platform: selectedPlatform || 'all'
    });
  };

  // 搜索查询变化
  const onSearchQueryChange = (query: string) => {
    searchActions.setSearchQuery(query);
  };



  // 任务删除处理
  const onTaskDelete = (taskId: string) => {
    downloadActions.removeTask(taskId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ModernLayout
        activeType={activeType}
        searchQuery={searchQuery}
        searchResults={searchResults}
        selectedPlatform={selectedPlatform}
        availablePlatforms={[]}
        loading={false}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onTypeChange={onTypeChange}
        onPlatformChange={onPlatformChange}
        onSearch={onSearch}
        onDownload={onDownload}
        onSearchQueryChange={onSearchQueryChange}
      />
      
      <div className="container mx-auto px-4 py-6">
        <TaskList 
          tasks={tasks} 
          onTaskDelete={onTaskDelete}
        />
      </div>
    </div>
  );
}

export default App;