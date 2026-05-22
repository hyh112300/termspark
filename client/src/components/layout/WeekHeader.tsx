import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useCallback } from 'react';

interface WeekHeaderProps {
  weekNumber: number;
  dateRange: string;
  isDark: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onToggleDark: () => void;
}

export default function WeekHeader({
  weekNumber, dateRange, isDark,
  onPrevWeek, onNextWeek, onCurrentWeek, onToggleDark,
}: WeekHeaderProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent, cb: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb(); }
  }, []);

  return (
    <header className="sticky top-0 z-30">
      {/* Frosted glass bar */}
      <div className="header-glass px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-white">
          {/* Logo — hide on smallest screens */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-xl text-hand font-bold tracking-wide select-none drop-shadow-sm shrink-0">
              TermSpark
            </h1>
            <span className="hidden sm:block text-[10px] uppercase tracking-wider opacity-60 font-medium border-l border-white/20 pl-3 leading-none">
              设计术语
            </span>
          </div>

          {/* Week nav */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={onPrevWeek}
              onKeyDown={(e) => handleKeyDown(e, onPrevWeek)}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="上一周"
              tabIndex={0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onCurrentWeek}
              onKeyDown={(e) => handleKeyDown(e, onCurrentWeek)}
              className="flex flex-col items-center px-2 sm:px-4 py-0.5 rounded-md hover:bg-white/10 transition-colors min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              tabIndex={0}
            >
              <span className="text-xs sm:text-sm font-semibold text-hand leading-tight">
                第{weekNumber}周
              </span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] opacity-70 font-medium leading-tight date-num whitespace-nowrap">
                {dateRange}
              </span>
            </button>

            <button
              onClick={onNextWeek}
              onKeyDown={(e) => handleKeyDown(e, onNextWeek)}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="下一周"
              tabIndex={0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
            aria-label={isDark ? '切换亮色模式' : '切换暗色模式'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subtle shadow */}
      <div className="h-0.5 bg-gradient-to-b from-black/[0.06] to-transparent" />
    </header>
  );
}
