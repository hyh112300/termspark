interface DateMarkerProps {
  date: string;
  dayName: string;
  displayDate: string;
  isToday: boolean;
  imageCount: number;
  collapsed: boolean;
  onToggle: () => void;
}

export default function DateMarker({
  date,
  dayName,
  displayDate,
  isToday,
  imageCount,
  collapsed,
  onToggle,
}: DateMarkerProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 py-2 w-full text-left group"
    >
      {/* Timeline dot — visible on md+ */}
      <div className="hidden md:flex items-center justify-center w-8 shrink-0">
        <div className={isToday ? 'timeline-dot-today' : 'timeline-dot'} />
      </div>

      {/* Date text */}
      <div className="flex items-center gap-2 min-w-0">
        <span className={`font-semibold text-sm leading-tight ${
          isToday
            ? 'text-[var(--accent)]'
            : 'text-[var(--text-primary)]'
        }`}>
          {dayName}
        </span>
        <span className={`text-[15px] sm:text-[17px] font-semibold leading-tight ${
          isToday
            ? 'text-[var(--accent)]'
            : 'text-[var(--text-primary)]'
        }`}>
          {displayDate}
        </span>
        {isToday && (
          <span className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-full">
            今天
          </span>
        )}
        {imageCount > 0 && (
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
            {imageCount} 张
          </span>
        )}
      </div>

      {/* Collapse icon */}
      <div className="ml-auto text-[var(--text-tertiary)] transition-transform duration-200 shrink-0"
        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 5l3 3 3-3" />
        </svg>
      </div>
    </button>
  );
}
