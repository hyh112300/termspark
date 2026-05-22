import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';

interface NotesRowProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  saving: boolean;
}

export default function NotesRow({ initialContent, onSave, saving }: NotesRowProps) {
  const [content, setContent] = useState(initialContent);
  const [height, setHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Auto-save with debounce
  const handleChange = useCallback((value: string) => {
    setContent(value);
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      onSave(value);
    }, 1500);
  }, [onSave]);

  // Resize handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  }, [height]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startYRef.current - e.clientY;
      setHeight(Math.max(120, Math.min(600, startHeightRef.current + diff)));
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <motion.div
      layout
      className="rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 overflow-hidden"
      style={{ height }}
    >
      {/* Drag handle */}
      <div
        className="resize-handle flex items-center justify-center cursor-row-resize select-none"
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="w-4 h-4 text-(--text-muted)" />
      </div>

      <div className="flex items-center gap-2 px-4 pt-1">
        <span className="text-sm font-semibold text-(--text-primary)">笔记</span>
        {saving && (
          <span className="text-xs text-(--text-muted) animate-pulse">保存中...</span>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="记点东西..."
        className="w-full h-[calc(100%-40px)] px-4 py-2 bg-transparent resize-none text-sm
          text-(--text-primary) placeholder-(--text-muted)/50
          focus:outline-none text-hand leading-relaxed"
      />
    </motion.div>
  );
}
