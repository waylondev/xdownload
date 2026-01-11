import { useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ResultsListProps {
  onDownload: (item: any) => void;
}

export function ResultsList({ onDownload }: ResultsListProps) {
  const queryClient = useQueryClient();
  
  // 从React Query缓存中获取搜索结果
  const searchData = queryClient.getQueryData(['search']) as any;
  const results = searchData?.items || [];

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-2xl mb-2">🔍</div>
        <p>输入关键词开始搜索</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-lg font-semibold">搜索结果 ({results.length})</h3>
      
      {results.map((item: any) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                  {item.size && <span>大小: {item.size}</span>}
                  {item.duration && <span>时长: {item.duration}</span>}
                  {item.platform && <span>平台: {item.platform}</span>}
                </div>
              </div>
              
              <Button 
                size="sm" 
                onClick={() => onDownload(item)}
                className="ml-4"
              >
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}