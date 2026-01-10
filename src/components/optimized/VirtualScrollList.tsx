// 虚拟滚动列表组件 - 处理大量数据时的性能优化
import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  keyExtractor: (item: T, index: number) => string;
}

// 虚拟滚动列表组件 - 使用memo优化性能
export const VirtualScrollList = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  keyExtractor
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见区域
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleItemCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
    const endIndex = Math.min(items.length, startIndex + visibleItemCount);
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 可见的项目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // 总高度
  const totalHeight = items.length * itemHeight;
  
  // 偏移量
  const offsetY = visibleRange.startIndex * itemHeight;

  // 滚动处理 - 使用防抖优化性能
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);

  // 自动滚动到顶部
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, []);



  // 重置滚动位置当items变化 - 使用浅比较优化
  useEffect(() => {
    scrollToTop();
  }, [items.length, scrollToTop]);

  // 内存优化 - 清理不可见的项目引用
  useEffect(() => {
    return () => {
      // 清理函数，防止内存泄漏
      setScrollTop(0);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <MemoizedItem
                key={keyExtractor(item, actualIndex)}
                item={item}
                index={actualIndex}
                height={itemHeight}
                renderItem={renderItem}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

// Memoized项目组件 - 防止不必要的重渲染
interface ItemProps<T> {
  item: T;
  index: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

const MemoizedItem = memo(<T,>({ item, index, height, renderItem }: ItemProps<T>) => {
  return (
    <div
      style={{ height }}
      className="absolute top-0 left-0 right-0"
    >
      {renderItem(item, index)}
    </div>
  );
}) as <T>(props: ItemProps<T>) => React.ReactElement;

// 使用示例组件
export function VirtualSearchResults({ 
  results, 
  onSelect 
}: { 
  results: any[];
  onSelect: (item: any) => void;
}) {
  const renderItem = useCallback((item: any) => (
    <div 
      className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => onSelect(item)}
    >
      <h4 className="font-medium text-sm truncate">{item.title}</h4>
      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{item.platform}</span>
        <span>{item.size}</span>
      </div>
    </div>
  ), [onSelect]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <VirtualScrollList
      items={results}
      itemHeight={80} // 每个项目的高度
      containerHeight={400} // 容器高度
      renderItem={renderItem}
      overscan={3} // 预渲染的项目数量
      keyExtractor={keyExtractor}
    />
  );
}