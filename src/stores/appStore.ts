import { create } from 'zustand';

interface AppState {
  // 搜索状态
  searchQuery: string;
  
  // 下载类型
  activeType: 'music' | 'video' | 'file';
  
  // 选中的平台
  selectedPlatform: string;
  
  // 当前活跃视图
  activeView: 'search' | 'download';
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // 操作
  setSearchQuery: (query: string) => void;
  setActiveType: (type: 'music' | 'video' | 'file') => void;
  setSelectedPlatform: (platform: string) => void;
  setActiveView: (view: 'search' | 'download') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  searchQuery: '',
  activeType: 'music',
  selectedPlatform: 'all',
  activeView: 'search',
  loading: false,
  error: null,
  
  // 操作
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveType: (type) => set({ activeType: type }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setActiveView: (view) => set({ activeView: view }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));