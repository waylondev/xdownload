// 优化的搜索结果组件 - 使用React.memo和自定义比较函数
import React, { memo } from 'react';

interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  size: string;
  platform: string;
  type: string;
}

interface SearchResultProps {
  item: SearchResultItem;
  onSelect: (item: SearchResultItem) => void;
  isSelected: boolean;
  index: number;
}

// 自定义比较函数，避免不必要的重渲染
const arePropsEqual = (prevProps: SearchResultProps, nextProps: SearchResultProps) => {
  // 只有当item的id或isSelected状态变化时才重渲染
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.index === nextProps.index
  );
};

const SearchResultItemComponent: React.FC<SearchResultProps> = ({ 
  item, 
  onSelect, 
  isSelected, 
  index 
}) => {
  console.log(`渲染搜索结果项: ${item.title} (索引: ${index})`);

  const handleClick = () => {
    onSelect(item);
  };

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {item.thumbnail && (
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className="w-16 h-16 object-cover rounded"
            loading="lazy" // 懒加载优化
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.title}
          </h3>
          
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>平台: {item.platform}</span>
            <span>时长: {item.duration}</span>
            <span>大小: {item.size}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
            {item.type}
          </span>
          {isSelected && (
            <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">
              已选择
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 使用React.memo进行优化，避免不必要的重渲染
export const MemoizedSearchResult = memo(SearchResultItemComponent, arePropsEqual);