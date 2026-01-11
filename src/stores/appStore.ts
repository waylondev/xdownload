import { create } from 'zustand';

interface AppState {
  // 搜索状态
  searchQuery: string;
  
  // 下载类型
  activeType: 'music' | 'video' | 'file';
  
  // 选中的平台
  selectedPlatform: string;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // 操作
  setSearchQuery: (query: string) => void;
  setActiveType: (type: 'music' | 'video' | 'file') => void;
  setSelectedPlatform: (platform: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  searchQuery: '',
  activeType: 'music',
  selectedPlatform: 'all',
  loading: false,
  error: null,
  
  // 操作
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveType: (type) => set({ activeType: type }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));