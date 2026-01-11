import { useAppStore } from './stores/appStore';
import { useSearch, usePlatforms, useTasks, useDownload } from './hooks/api';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import TaskList from './components/TaskList';

function App() {
  // 状态
  const { searchQuery, activeType, selectedPlatform, setSearchQuery, setActiveType, setSelectedPlatform } = useAppStore();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-6">
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
        
        {/* 任务列表 */}
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}

export default App;