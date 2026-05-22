import { useState, useCallback, useEffect, useRef } from 'react';

interface DayNoteProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  saving: boolean;
}

export default function DayNote({ content, onSave, saving }: DayNoteProps) {
  const [value, setValue] = useState(content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      onSave(v);
    }, 1500);
  }, [onSave]);

  return (
    <div className="day-note relative">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="记录今天的设计灵感..."
        rows={3}
        className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed placeholder:text-[var(--text-tertiary)]"
      />
      <div className="absolute bottom-2 right-3 flex items-center gap-2">
        {saving && (
          <span className="text-[10px] text-[var(--text-tertiary)] animate-pulse">保存中...</span>
        )}
        {!saving && value.length > 0 && (
          <span className="text-[10px] text-[var(--text-tertiary)]">{value.length} 字</span>
        )}
      </div>
    </div>
  );
}
