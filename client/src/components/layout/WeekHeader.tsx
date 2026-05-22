import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import Button from '@/components/ui/Button';

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
  return (
    <header className="sticky top-0 z-30 bg-(--bg-primary)/90 backdrop-blur-md border-b border-(--border-color)">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl text-hand text-(--accent) font-bold select-none">
            TermSpark
          </h1>
          <span className="text-xs text-(--text-muted) px-2 py-0.5 rounded-full border border-(--border-color)">
            beta
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <button
            onClick={onCurrentWeek}
            className="flex flex-col items-center px-4 py-1 rounded-lg hover:bg-(--bg-secondary) transition-colors"
          >
            <span className="text-sm font-semibold text-(--text-primary)">
              第 {weekNumber} 周
            </span>
            <span className="text-xs text-(--text-muted)">
              {dateRange}
            </span>
          </button>

          <Button variant="ghost" size="icon" onClick={onNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={onToggleDark}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  );
}
