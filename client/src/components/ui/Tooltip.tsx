import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => {
        clearTimeout(timeoutRef.current ?? undefined);
        setVisible(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setVisible(false), 150);
      }}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-xs rounded-md bg-warm-ink text-amber-100 dark:bg-amber-100 dark:text-warm-ink shadow-lg pointer-events-none whitespace-nowrap ${sideClasses[side]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
