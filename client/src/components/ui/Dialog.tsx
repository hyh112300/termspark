import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Dialog({ open, onClose, children, title }: DialogProps) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-(--bg-primary) rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
          {title && <h3 className="font-semibold text-(--text-primary)">{title}</h3>}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--bg-secondary) transition-colors">
            <X className="w-5 h-5 text-(--text-muted)" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
