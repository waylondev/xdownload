import { cn } from "../../lib/utils";

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  actions?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  thumbnail,
  actions,
  selected = false,
  onSelect,
  className
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors",
        selected && "bg-blue-50 border-blue-200",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={onSelect}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};