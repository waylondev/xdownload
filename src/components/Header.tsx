import { Button } from "./ui/button";

interface HeaderProps {
  onSettingsClick?: () => void;
  onAboutClick?: () => void;
}

const Header = ({ onSettingsClick, onAboutClick }: HeaderProps) => {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">XDownload</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSettingsClick}>
            设置
          </Button>
          <Button variant="secondary" onClick={onAboutClick}>
            关于
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
