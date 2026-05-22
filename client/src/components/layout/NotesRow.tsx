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

  const handleChange = useCallback((value: string) => {
    setContent(value);
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      onSave(value);
    }, 1500);
  }, [onSave]);

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
      className="sticky-note overflow-hidden"
      style={{ height }}
    >
      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown}>
        <GripHorizontal className="w-3.5 h-3.5 text-(--text-muted)" />
      </div>

      {/* Header */}
      <div className="px-4 pt-0 pb-1 flex items-center justify-between select-none">
        <span className="text-sm text-hand font-semibold text-(--ink-soft)">
          📝 笔记
        </span>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-(--text-muted) animate-pulse font-sans">
              保存中...
            </span>
          )}
          {!saving && content.length > 0 && (
            <span className="text-[10px] text-(--text-muted)/50 font-sans">
              {content.length} 字
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="粘贴截图后，在这里记录你的设计思考..."
        className="w-full h-[calc(100%-42px)] px-4 py-1.5 bg-transparent resize-none text-sm
          text-(--text-primary) placeholder-(--text-muted)/30
          focus:outline-none text-hand leading-relaxed"
      />
    </motion.div>
  );
}
