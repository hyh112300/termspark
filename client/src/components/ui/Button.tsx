import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          variant === 'default' && 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
          variant === 'ghost' && 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]',
          variant === 'outline' && 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'icon' && 'p-2',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;
