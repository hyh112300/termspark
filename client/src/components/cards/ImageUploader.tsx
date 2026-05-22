import { useCallback, useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function ImageUploader({ onUpload, uploading }: ImageUploaderProps) {
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    await onUpload(file);
  }, [onUpload]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] ${
        dragover ? '!border-[var(--accent)] !bg-[var(--accent-bg)]' : ''
      } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span className="text-sm text-[var(--text-secondary)]">分析中...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-sm text-[var(--text-tertiary)]">粘贴截图或拖拽上传</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </motion.div>
  );
}
