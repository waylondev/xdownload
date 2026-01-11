import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { DownloadType } from '../types';

interface AppState {
  // 搜索相关状态
  searchQuery: string;
  selectedResults: string[];
  currentPage: number;
  totalPages: number;
  
  // 下载相关状态
  activeType: DownloadType;
  selectedPlatform: string;
  
  // UI 状态
  loading: boolean;
  error: string | null;
}

interface AppActions {
  // 搜索操作
  setSearchQuery: (query: string) => void;
  setSelectedResults: (ids: string[]) => void;
  toggleResultSelection: (id: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  clearSearch: () => void;
  
  // 下载操作
  setActiveType: (type: DownloadType) => void;
  setSelectedPlatform: (platform: string) => void;
  
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
  selectedResults: [],
  currentPage: 1,
  totalPages: 1,
  
  activeType: 'music',
  selectedPlatform: 'all',
  
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
        
        setSelectedResults: (ids: string[]) => set({ selectedResults: ids }),
        
        toggleResultSelection: (id: string) => {
          const { selectedResults } = get();
          const newSelected = selectedResults.includes(id)
            ? selectedResults.filter(itemId => itemId !== id)
            : [...selectedResults, id];
          set({ selectedResults: newSelected });
        },
        
        setCurrentPage: (page: number) => set({ currentPage: page }),
        
        setTotalPages: (pages: number) => set({ totalPages: pages }),
        
        clearSearch: () => set({
          selectedResults: [],
          currentPage: 1,
          totalPages: 1
        }),

        // 下载操作
        setActiveType: (type: DownloadType) => set({ 
          activeType: type,
          selectedPlatform: 'all',
          selectedResults: [],
          currentPage: 1,
          totalPages: 1
        }),
        
        setSelectedPlatform: (platform: string) => set({ selectedPlatform: platform }),

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
export const useSelectedResults = () => useAppStore(state => state.selectedResults);
export const usePagination = () => useAppStore(state => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages
}));

// 下载相关选择器
export const useActiveType = () => useAppStore(state => state.activeType);
export const useSelectedPlatform = () => useAppStore(state => state.selectedPlatform);

// UI 相关选择器
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);

// 计算属性选择器
export const useSelectedCount = () => useAppStore(state => state.selectedResults.length);

// 操作选择器
export const useSearchActions = () => useAppStore(state => ({
  setSearchQuery: state.setSearchQuery,
  setSelectedResults: state.setSelectedResults,
  toggleResultSelection: state.toggleResultSelection,
  setCurrentPage: state.setCurrentPage,
  setTotalPages: state.setTotalPages,
  clearSearch: state.clearSearch,
  setLoading: state.setLoading,
  setError: state.setError
}));

export const useDownloadActions = () => useAppStore(state => ({
  setActiveType: state.setActiveType,
  setSelectedPlatform: state.setSelectedPlatform
}));

export const useUIActions = () => useAppStore(state => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError
}));