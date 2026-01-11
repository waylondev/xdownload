import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { DownloadType, SearchResult, DownloadTask, PlatformInfo } from '../types';

interface AppState {
  // 搜索相关状态
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResults: string[];
  currentPage: number;
  totalPages: number;
  
  // 下载相关状态
  activeType: DownloadType;
  selectedPlatform: string;
  tasks: DownloadTask[];
  platforms: PlatformInfo[];
  
  // UI 状态
  loading: boolean;
  error: string | null;
}

interface AppActions {
  // 搜索操作
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSelectedResults: (ids: string[]) => void;
  toggleResultSelection: (id: string) => void;
  toggleSelectAll: () => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  clearSearch: () => void;
  
  // 下载操作
  setActiveType: (type: DownloadType) => void;
  setSelectedPlatform: (platform: string) => void;
  setTasks: (tasks: DownloadTask[]) => void;
  addTask: (task: DownloadTask) => void;
  updateTask: (taskId: string, updates: Partial<DownloadTask>) => void;
  removeTask: (taskId: string) => void;
  setPlatforms: (platforms: PlatformInfo[]) => void;
  
  // UI 操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 批量操作
  clearSelectedResults: () => void;
}

type AppStore = AppState & AppActions;

// 初始状态
const initialState: AppState = {
  searchQuery: '',
  searchResults: [],
  selectedResults: [],
  currentPage: 1,
  totalPages: 1,
  
  activeType: 'music',
  selectedPlatform: 'all',
  tasks: [],
  platforms: [],
  
  loading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 搜索操作
        setSearchQuery: (query: string) => set({ searchQuery: query }),
        
        setSearchResults: (results: SearchResult[]) => set({ 
          searchResults: results,
          selectedResults: []
        }),
        
        setSelectedResults: (ids: string[]) => set({ selectedResults: ids }),
        
        toggleResultSelection: (id: string) => {
          const { selectedResults } = get();
          const newSelected = selectedResults.includes(id)
            ? selectedResults.filter(itemId => itemId !== id)
            : [...selectedResults, id];
          set({ selectedResults: newSelected });
        },
        
        toggleSelectAll: () => {
          const { searchResults, selectedResults } = get();
          const allSelected = selectedResults.length === searchResults.length;
          set({
            selectedResults: allSelected ? [] : searchResults.map(result => result.id)
          });
        },
        
        setCurrentPage: (page: number) => set({ currentPage: page }),
        
        setTotalPages: (pages: number) => set({ totalPages: pages }),
        
        clearSearch: () => set({
          searchResults: [],
          selectedResults: [],
          currentPage: 1,
          totalPages: 1
        }),

        // 下载操作
        setActiveType: (type: DownloadType) => set({ 
          activeType: type,
          selectedPlatform: 'all',
          searchResults: [],
          selectedResults: [],
          currentPage: 1,
          totalPages: 1
        }),
        
        setSelectedPlatform: (platform: string) => set({ selectedPlatform: platform }),
        
        setTasks: (tasks: DownloadTask[]) => set({ tasks }),
        
        addTask: (task: DownloadTask) => {
          const { tasks } = get();
          set({ tasks: [...tasks, task] });
        },
        
        updateTask: (taskId: string, updates: Partial<DownloadTask>) => {
          const { tasks } = get();
          set({
            tasks: tasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          });
        },
        
        removeTask: (taskId: string) => {
          const { tasks } = get();
          set({ tasks: tasks.filter(task => task.id !== taskId) });
        },
        
        setPlatforms: (platforms: PlatformInfo[]) => set({ platforms }),

        // UI 操作
        setLoading: (loading: boolean) => set({ loading }),
        
        setError: (error: string | null) => set({ error }),
        
        clearError: () => set({ error: null }),

        // 批量操作
        clearSelectedResults: () => set({ selectedResults: [] })
      }),
      {
        name: 'app-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // 只持久化用户偏好设置，不保存临时数据
          activeType: state.activeType,
          selectedPlatform: state.selectedPlatform,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    {
      name: 'app-store',
      trace: true
    }
  )
);

// 选择器 - 用于性能优化
// 搜索相关选择器
export const useSearchQuery = () => useAppStore(state => state.searchQuery);
export const useSearchResults = () => useAppStore(state => state.searchResults);
export const useSelectedResults = () => useAppStore(state => state.selectedResults);
export const usePagination = () => useAppStore(state => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages
}));

// 下载相关选择器
export const useActiveType = () => useAppStore(state => state.activeType);
export const useSelectedPlatform = () => useAppStore(state => state.selectedPlatform);
export const useTasks = () => useAppStore(state => state.tasks);
export const usePlatforms = () => useAppStore(state => state.platforms);

// UI 相关选择器
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);

// 计算属性选择器
export const useSelectedCount = () => useAppStore(state => state.selectedResults.length);
export const useIsAllSelected = () => useAppStore(state => 
  state.searchResults.length > 0 && 
  state.selectedResults.length === state.searchResults.length
);

// 操作选择器
export const useSearchActions = () => useAppStore(state => ({
  setSearchQuery: state.setSearchQuery,
  setSearchResults: state.setSearchResults,
  setSelectedResults: state.setSelectedResults,
  toggleResultSelection: state.toggleResultSelection,
  toggleSelectAll: state.toggleSelectAll,
  setCurrentPage: state.setCurrentPage,
  setTotalPages: state.setTotalPages,
  clearSearch: state.clearSearch,
  setLoading: state.setLoading,
  setError: state.setError
}));

export const useDownloadActions = () => useAppStore(state => ({
  setActiveType: state.setActiveType,
  setSelectedPlatform: state.setSelectedPlatform,
  setTasks: state.setTasks,
  addTask: state.addTask,
  updateTask: state.updateTask,
  removeTask: state.removeTask,
  setPlatforms: state.setPlatforms
}));

export const useUIActions = () => useAppStore(state => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError
}));