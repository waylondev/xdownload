import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Music, Film, FileText, Clock, File, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ResultsListProps {
  onDownload: (item: any) => void;
}

// 获取文件类型图标
const getFileTypeIcon = (type: string) => {
  switch (type) {
    case 'audio':
    case 'music':
      return <Music className="w-8 h-8 text-blue-400" />;
    case 'video':
      return <Film className="w-8 h-8 text-purple-400" />;
    case 'document':
    case 'file':
      return <FileText className="w-8 h-8 text-green-400" />;
    default:
      return <File className="w-8 h-8 text-slate-400" />;
  }
};

export function ResultsList({ onDownload }: ResultsListProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const pageSize = 10;
  
  // 从React Query缓存中获取搜索结果
  const searchData = queryClient.getQueryData(['search']) as any;
  const results = searchData?.items || [];
  const totalItems = searchData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 分页计算
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = results.slice(startIndex, startIndex + pageSize);

  // 重置页码和选中项当搜索结果变化时
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems(new Set());
  }, [results.length]);

  // 重置选中项当页面变化时
  useEffect(() => {
    setSelectedItems(new Set());
  }, [currentPage]);

  // 全选/取消全选功能
  const handleSelectAll = () => {
    if (selectedItems.size === paginatedResults.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = paginatedResults.map((item: any) => item.id);
      setSelectedItems(new Set(allIds));
    }
  };

  // 单个选中/取消选中功能
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-xl">
          <File className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-300 mb-3">暂无搜索结果</h3>
        <p className="text-lg text-slate-500">输入关键词开始搜索</p>
        <p className="text-sm text-slate-600 mt-2">支持音乐、视频、文件搜索</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* 结果统计和操作 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">搜索结果</h3>
          <p className="text-sm text-slate-500 mt-1">为您找到 {totalItems} 条相关结果</p>
        </div>
        
        {/* 批量操作按钮 */}
        <div className="flex items-center gap-3">
          {/* 全选按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl px-4 py-2 transition-all duration-300"
          >
            {selectedItems.size === paginatedResults.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>全选</span>
            {selectedItems.size > 0 && (
              <span className="text-xs text-slate-500">({selectedItems.size}/{paginatedResults.length})</span>
            )}
          </Button>
          
          {/* 批量下载按钮 */}
          {selectedItems.size > 0 && (
            <Button
              size="sm"
              onClick={() => {
                const selectedResults = paginatedResults.filter((item: any) => selectedItems.has(item.id));
                selectedResults.forEach((item: any) => onDownload(item));
                setSelectedItems(new Set());
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl px-4 py-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>批量下载 ({selectedItems.size})</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* 结果列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {paginatedResults.map((item: any) => (
          <Card 
              key={item.id} 
              className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 hover:border-blue-500/40 transition-all duration-500 overflow-hidden rounded-2xl shadow-xl hover:shadow-blue-500/20 group"
            >
              {/* 卡片装饰 */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
              <CardContent className="p-5">
              {/* 媒体预览 */}
              <div className="w-full h-40 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 relative mb-4">
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {getFileTypeIcon(item.fileType)}
                  </div>
                )}
                {/* 时长显示 - 仅视频和音乐显示 */}
                {(item.duration && (item.fileType === 'video' || item.fileType === 'audio' || item.fileType === 'music')) && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                )}
              </div>
              
              {/* 标题 */}
              <h4 className="text-lg font-semibold text-slate-100 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 mb-2">
                {item.title}
              </h4>
              
              {/* 文件信息 */}
              <div className="flex flex-wrap items-center gap-2 mt-2 mb-4 text-sm">
                {/* 平台 */}
                <Badge variant="secondary" className="bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-0 rounded-full px-2 py-0.5 text-xs">
                  {item.platform}
                </Badge>
                
                {/* 文件类型 */}
                <Badge variant="secondary" className="bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-0 rounded-full px-2 py-0.5 text-xs capitalize">
                  {item.fileType}
                </Badge>
                
                {/* 大小 */}
                {item.size && (
                  <span className="text-slate-500">{item.size}</span>
                )}
                
                {/* 质量 */}
                {item.quality && (
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0 rounded-full px-2 py-0.5 text-xs">
                    {item.quality}
                  </Badge>
                )}
                
                {/* 格式 */}
                {item.format && (
                  <Badge variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 rounded-full px-2 py-0.5 text-xs font-mono">
                    {item.format}
                  </Badge>
                )}
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                {/* 下载按钮 */}
                <Button
                  onClick={() => onDownload(item)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl py-2.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="font-medium">下载</span>
                </Button>
                
                {/* 复选框 */}
                <div 
                  className="cursor-pointer flex-shrink-0" 
                  onClick={() => handleSelectItem(item.id)}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${selectedItems.has(item.id) ? 'bg-blue-600 text-white' : 'bg-slate-800/80 hover:bg-blue-600/50 text-white'}`}>
                    {selectedItems.has(item.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl px-5 py-2.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            上一页
          </Button>
          
          {/* 页码 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // 计算显示的页码范围
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-11 h-11 p-0 rounded-xl transition-all duration-300 ${currentPage === pageNumber ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'}`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl px-5 py-2.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            下一页
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}