import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Check, Plus, Download } from "lucide-react";
import { SearchResult } from "../types";

interface SearchResultsProps {
  results: SearchResult[];
  selectedResults: string[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onDownload: (result: SearchResult) => void;
  onBatchDownload: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SearchResults = ({
  results,
  selectedResults,
  onToggleSelection,
  onToggleSelectAll,
  onDownload,
  onBatchDownload,
  currentPage,
  totalPages,
  onPageChange
}: SearchResultsProps) => {
  const isAllSelected = results.length > 0 && selectedResults.length === results.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">搜索结果 ({results.length})</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onToggleSelectAll}>
            <Check className="w-4 h-4" />
            {isAllSelected ? "取消全选" : "全选"}
          </Button>
          <Button 
            variant="default" 
            onClick={onBatchDownload}
            disabled={selectedResults.length === 0}
          >
            <Plus className="w-4 h-4" />
            下载所选 ({selectedResults.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无搜索结果
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-md border transition-all ${selectedResults.includes(result.id)
                  ? 'border-primary bg-primary/10 dark:bg-primary/20 dark:border-primary/30'
                  : 'border-border hover:border-accent dark:hover:border-accent/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.artist && <span className="mr-2">{result.artist}</span>}
                      {result.duration && <span className="mr-2">{result.duration}</span>}
                      {result.size && <span>{result.size}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => onDownload(result)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <button
                      className="flex-shrink-0 p-1 rounded transition-colors hover:bg-accent/20 dark:hover:bg-accent/10"
                      onClick={() => onToggleSelection(result.id)}
                    >
                      <Check
                        className={`w-4 h-4 ${selectedResults.includes(result.id)
                          ? 'text-primary dark:text-primary'
                          : 'text-muted-foreground'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          第 {currentPage} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SearchResults;
