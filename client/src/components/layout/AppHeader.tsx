import { Search, Sun, Moon, ArrowUpCircle } from 'lucide-react';

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
    <header className="sticky top-0 z-30 glass-l3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-[17px] sm:text-xl font-bold tracking-tight select-none shrink-0 text-[var(--text-primary)]">
            TermSpark
          </h1>
          <span className="hidden sm:block font-hand text-sm text-[var(--text-secondary)] border-l border-[var(--border)] pl-3 leading-none pt-0.5">
            设计术语灵感剪切板
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            onClick={onSearch}
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="搜索"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Today */}
          <button
            onClick={onToday}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors"
            aria-label="回到今天"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">今天</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label={isDark ? '切换亮色模式' : '切换暗色模式'}
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
