import React from 'react';
import ModernLayout from './components/ModernLayout';
import TaskList from './components/TaskList';
import { SearchResult } from './types';

// 状态管理
import {
  useSearchQuery,
  useActiveType,
  useSelectedPlatform,
  useSearchActions,
  useDownloadActions
} from './stores/appStore';

// TanStack Query
import { usePlatformsQuery, useTasksQuery, useStartDownloadMutation, useSearchResultsQuery } from './hooks/useReactQuery';

function App() {
  // 本地状态
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Zustand状态
  const searchQuery = useSearchQuery();
  const activeType = useActiveType();
  const selectedPlatform = useSelectedPlatform();

  // Zustand操作
  const searchActions = useSearchActions();
  const downloadActions = useDownloadActions();

  // TanStack Query数据加载
  const { data: platformsData } = usePlatformsQuery();
  const { data: tasksData } = useTasksQuery(activeType);
  const { mutate: startDownload } = useStartDownloadMutation();

  // 使用useSearchResultsQuery获取搜索结果
  const { data: searchResponse, isLoading: searchLoading } = useSearchResultsQuery(
    searchQuery,
    activeType,
    selectedPlatform || 'all',
    1,
    {
      enabled: !!searchQuery.trim() // 只有当搜索查询不为空时才执行
    }
  );

  // 将搜索响应转换为ModernLayout期望的SearchResult[]类型
  const searchResults = React.useMemo(() => {
    if (!searchResponse || !Array.isArray(searchResponse.items)) {
      return [];
    }
    return searchResponse.items as unknown as SearchResult[];
  }, [searchResponse]);

  const onSearch = () => {
    // 搜索会自动触发，因为我们启用了enabled条件
    // 这里可以添加额外的逻辑，比如滚动到顶部等
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ModernLayout
        activeType={activeType}
        searchQuery={searchQuery}
        searchResults={searchResults || []}
        selectedPlatform={selectedPlatform}
        availablePlatforms={platformsData || []}
        loading={searchLoading}
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
          tasks={tasksData || []}
        />
      </div>
    </div>
  );
}

export default App;