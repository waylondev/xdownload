import React, { useCallback, memo } from 'react';
import { DownloadType } from "../types";
import { Music, Film, FileText, ChevronLeft, ChevronRight, Search, Download, Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

import { SearchResult } from '../types';

interface ModernLayoutProps {
  activeType: DownloadType;
  selectedPlatform: string;
  searchQuery: string;
  searchResults: SearchResult[];
  availablePlatforms: PlatformInfo[];
  loading: boolean;
  sidebarCollapsed: boolean;
  onTypeChange: (type: DownloadType) => void;
  onPlatformChange: (platform: string) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onDownload: (result: SearchResult) => void;
  onBatchDownload?: (selectedResults: string[]) => void;
  onToggleSidebar: () => void;
}

const ModernLayout = ({
  activeType,
  selectedPlatform,
  searchQuery,
  searchResults,
  availablePlatforms,
  loading,
  sidebarCollapsed,
  onTypeChange,
  onPlatformChange,
  onSearchQueryChange,
  onSearch,
  onDownload,
  onToggleSidebar
}: ModernLayoutProps) => {

  // 下载类型配置
  const downloadTypes = [
    { id: "music" as DownloadType, name: "音乐", icon: Music, color: "text-pink-500" },
    { id: "video" as DownloadType, name: "视频", icon: Film, color: "text-blue-500" },
    { id: "file" as DownloadType, name: "文件", icon: FileText, color: "text-green-500" },
  ];

  // 处理键盘事件 - 使用 useCallback 优化性能
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  }, [onSearch]);

  // 获取类型标签
  const getTypeLabel = (type: DownloadType): string => {
    switch (type) {
      case "music": return "音乐";
      case "video": return "视频";
      case "file": return "文件";
      default: return "资源";
    }
  };

  // 限制显示10条结果
  const displayedResults = searchResults.slice(0, 10);

  // 加载状态组件

  const LoadingState = () => (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-slate-700 dark:text-slate-300 font-medium">搜索中...</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 侧边栏 - 现代化设计 */}
      <div className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-500 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-80'} ${'max-sm:absolute max-sm:z-50 max-sm:transform max-sm:transition-transform max-sm:duration-500' + (sidebarCollapsed ? ' max-sm:-translate-x-full' : ' max-sm:translate-x-0')}`}>
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  XDownload
                </h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* 下载类型导航 - 现代化设计 */}
        <div className="p-6">
          <div className="space-y-3">
            {downloadTypes.map((type) => {
              const IconComponent = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onTypeChange(type.id)}
                  className={`group flex items-center w-full p-4 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 shadow-sm' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:shadow-md'} ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <IconComponent className={`w-5 h-5 ${type.color} transition-colors duration-300`} />
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`ml-4 font-medium transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {type.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 项目地址 - 现代化设计 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <a 
            href="https://github.com/waylondev" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`group flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
          >
            <div className="relative">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3 truncate font-medium transition-all duration-300 group-hover:translate-x-1">
                github.com/waylondev
              </span>
            )}
          </a>
        </div>
      </div>

      {/* 主内容区域 - 现代化设计 */}
      <div className={`transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64 sm:ml-72 lg:ml-80'} ${'max-sm:ml-0 max-sm:w-full'}`}>
        <div className="p-4 sm:p-6">
          {/* 移动端菜单按钮 */}
          <div className="sm:hidden mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleSidebar}
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
            >
              <Menu className="w-4 h-4" />
              菜单
            </Button>
          </div>
          
          {/* 搜索和平台选择区域 - 现代化设计 */}
          <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 搜索框 */}
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-300 group-focus-within:text-blue-500" />
                    <Input
                      type="text"
                      placeholder={`搜索 ${getTypeLabel(activeType)}...`}
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/30 rounded-lg transition-all duration-300 text-sm"
                      disabled={loading}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* 平台选择 */}
                <div className="sm:w-48">
                  <div className="relative group">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => onPlatformChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 text-sm appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="">选择平台</option>
                      <option value="all">🌐 全部</option>
                      {availablePlatforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.icon} {platform.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* 搜索按钮 */}
                <Button 
                  onClick={onSearch} 
                  disabled={loading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg font-medium group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Search className="w-5 h-5 relative z-10" />
                  )}
                  <span className="ml-2 relative z-10">搜索</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 根据选择的页签显示不同内容 */}
          <div className="mt-6">
            {/* 音乐内容页 */}
            {activeType === 'music' && (
              <div>
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-pink-800 to-purple-600 dark:from-pink-300 dark:to-purple-400 bg-clip-text text-transparent mb-6">
                      音乐搜索
                    </h2>
                    
                    {/* 音乐搜索结果 */}
                    {loading ? (
                      <LoadingState />
                    ) : displayedResults.length > 0 ? (
                      <div className="space-y-4">
                        {displayedResults.map((result) => (
                          <div key={result.id} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl hover:shadow-md transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {result.title}
                                </h3>
                                {result.artist && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {result.artist}{result.album && ` - ${result.album}`}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                  {result.duration && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100/50 dark:bg-purple-900/20 rounded-full">
                                      <span className="text-purple-500">⏱️</span>
                                      {result.duration}
                                    </span>
                                  )}
                                  {result.size && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100/50 dark:bg-green-900/20 rounded-full">
                                      <span className="text-green-500">💾</span>
                                      {result.size}
                                    </span>
                                  )}
                                  {result.format && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100/50 dark:bg-orange-900/20 rounded-full">
                                      <span className="text-orange-500">📋</span>
                                      {result.format}
                                    </span>
                                  )}
                                  {result.platform && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full">
                                      <span className="text-indigo-500">🌐</span>
                                      {result.platform}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => onDownload(result)}
                                size="sm"
                                className="ml-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow hover:shadow-md transition-all duration-300"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          未找到音乐结果
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          尝试使用不同的关键词或选择其他平台进行搜索
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          音乐搜索
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          输入关键词搜索您喜爱的音乐
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 视频内容页 */}
            {activeType === 'video' && (
              <div>
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-300 dark:to-cyan-400 bg-clip-text text-transparent mb-6">
                      视频搜索
                    </h2>
                    
                    {/* 视频搜索结果 */}
                    {loading ? (
                      <LoadingState />
                    ) : displayedResults.length > 0 ? (
                      <div className="space-y-4">
                        {displayedResults.map((result) => (
                          <div key={result.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl hover:shadow-md transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {result.title}
                                </h3>
                                {result.uploader && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {result.uploader}{result.uploadDate && ` - ${result.uploadDate}`}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                  {result.duration && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-cyan-100/50 dark:bg-cyan-900/20 rounded-full">
                                      <span className="text-cyan-500">⏱️</span>
                                      {result.duration}
                                    </span>
                                  )}
                                  {result.size && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100/50 dark:bg-green-900/20 rounded-full">
                                      <span className="text-green-500">💾</span>
                                      {result.size}
                                    </span>
                                  )}
                                  {result.resolution && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full">
                                      <span className="text-indigo-500">🖥️</span>
                                      {result.resolution}
                                    </span>
                                  )}
                                  {result.format && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100/50 dark:bg-orange-900/20 rounded-full">
                                      <span className="text-orange-500">📋</span>
                                      {result.format}
                                    </span>
                                  )}
                                  {result.platform && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full">
                                      <span className="text-indigo-500">🌐</span>
                                      {result.platform}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => onDownload(result)}
                                size="sm"
                                className="ml-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow hover:shadow-md transition-all duration-300"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          未找到视频结果
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          尝试使用不同的关键词或选择其他平台进行搜索
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center">
                          <Film className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          视频搜索
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          输入关键词搜索您喜爱的视频
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 文件内容页 */}
            {activeType === 'file' && (
              <div>
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-300 dark:to-emerald-400 bg-clip-text text-transparent mb-6">
                      文件搜索
                    </h2>
                    
                    {/* 文件搜索结果 */}
                    {loading ? (
                      <LoadingState />
                    ) : displayedResults.length > 0 ? (
                      <div className="space-y-4">
                        {displayedResults.map((result) => (
                          <div key={result.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl hover:shadow-md transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {result.title}
                                </h3>
                                {result.description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                    {result.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                  {result.fileType && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100/50 dark:bg-blue-900/20 rounded-full">
                                      <span className="text-blue-500">📄</span>
                                      {result.fileType}
                                    </span>
                                  )}
                                  {result.size && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100/50 dark:bg-green-900/20 rounded-full">
                                      <span className="text-green-500">💾</span>
                                      {result.size}
                                    </span>
                                  )}
                                  {result.format && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100/50 dark:bg-orange-900/20 rounded-full">
                                      <span className="text-orange-500">📋</span>
                                      {result.format}
                                    </span>
                                  )}
                                  {result.platform && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full">
                                      <span className="text-indigo-500">🌐</span>
                                      {result.platform}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => onDownload(result)}
                                size="sm"
                                className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow hover:shadow-md transition-all duration-300"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          未找到文件结果
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          尝试使用不同的关键词或选择其他平台进行搜索
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          文件搜索
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          输入关键词搜索您需要的文件
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 使用 React.memo 优化性能，避免不必要的重渲染
export default memo(ModernLayout);