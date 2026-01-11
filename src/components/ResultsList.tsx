import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ResultsListProps {
  onDownload: (item: any) => void;
}

export function ResultsList({ onDownload }: ResultsListProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // 从React Query缓存中获取搜索结果
  const searchData = queryClient.getQueryData(['search']) as any;
  const results = searchData?.items || [];
  const totalItems = searchData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 重置页码当搜索结果变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [results.length]);

  // 分页计算
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = results.slice(startIndex, startIndex + pageSize);

  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-lg">输入关键词开始搜索</p>
        <p className="text-sm mt-2 text-slate-500">支持音乐、视频、文件搜索</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-100">搜索结果</h3>
        <p className="text-sm text-slate-400">共 {totalItems} 条结果</p>
      </div>
      
      {/* 结果列表 */}
      <div className="space-y-4">
        {paginatedResults.map((item: any) => (
          <Card key={item.id} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* 左侧内容 */}
                <div className="flex-1 min-w-0">
                  {/* 标题 */}
                  <h4 className="font-semibold text-lg text-slate-100 line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  
                  {/* 描述 */}
                  {item.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  )}
                  
                  {/* 文件信息 */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    {/* 平台 */}
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs px-2 py-1 bg-slate-700 rounded-full">
                        {item.platform}
                      </span>
                    </div>
                    
                    {/* 文件类型 */}
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs px-2 py-1 bg-slate-700 rounded-full capitalize">
                        {item.fileType}
                      </span>
                    </div>
                    
                    {/* 大小 */}
                    {item.size && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-xs">folder</span>
                        <span>{item.size}</span>
                      </div>
                    )}
                    
                    {/* 时长 */}
                    {item.duration && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>{item.duration}</span>
                      </div>
                    )}
                    
                    {/* 质量 */}
                    {item.quality && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                          {item.quality}
                        </span>
                      </div>
                    )}
                    
                    {/* 格式 */}
                    {item.format && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded">
                          {item.format}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 右侧下载按钮 */}
                <Button 
                  size="sm" 
                  onClick={() => onDownload(item)}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  下载
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
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
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 p-0 ${currentPage === pageNumber ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}