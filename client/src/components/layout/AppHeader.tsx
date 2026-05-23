import { Search, Moon, Sun, ArrowUp, Sparkles } from "lucide-react";

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
              让AI读懂设计：从像素到术语
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
        </div>
      </div>
    </header>
  );
}
