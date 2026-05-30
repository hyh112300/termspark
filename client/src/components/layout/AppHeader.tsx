import { useState, useRef, useEffect } from "react";
import {
  Search,
  Moon,
  Sun,
  ArrowUp,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSearch: () => void;
  onToday: () => void;
}

export default function AppHeader({
  isDark,
  onToggleDark,
  onSearch,
  onToday,
}: AppHeaderProps) {
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[color:var(--color-background)]/75 border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center rotate-[-6deg] shadow-md">
            <Sparkles
              className="w-5 h-5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <div className="leading-none">
            <h1 className="font-hand text-3xl text-foreground">TermSpark</h1>
            <p className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              AI读懂设计：像素到术语
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToday}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            今天
          </button>
          <button
            onClick={onSearch}
            aria-label="搜索"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleDark}
            aria-label="切换主题"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* 用户菜单 */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card border border-border rounded-xl shadow-lg">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">管理员</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
