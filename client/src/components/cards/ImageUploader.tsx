import { useCallback, useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function ImageUploader({ onUpload, uploading }: ImageUploaderProps) {
  const [dragover, setDragover] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    await onUpload(file);
  }, [onUpload]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setDragover(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragover(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      animate={dragover ? { scale: 1.03 } : { scale: 1 }}
      className={`relative flex flex-col items-center justify-center gap-4 px-8 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 select-none
        ${dragover
          ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-[var(--shadow-lg)]'
          : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]'
        }
        ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <span className="text-sm text-[var(--text-secondary)]">分析中...</span>
        </div>
      ) : (
        <>
          <motion.div
            animate={dragover ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
              dragover ? 'bg-[var(--accent)] shadow-[var(--shadow-md)]' : 'bg-[var(--bg-hover)]'
            }`}
          >
            <Upload className={`w-7 h-7 transition-colors duration-300 ${
              dragover ? 'text-white' : 'text-[var(--text-tertiary)]'
            }`} />
          </motion.div>

          <div className="text-center">
            <p className={`text-sm font-medium transition-colors duration-200 ${
              dragover ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}>
              {dragover ? '松开以添加图片' : '拖拽图片到此处'}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">或粘贴截图上传</p>
          </div>

          <motion.span
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="inline-block px-5 py-2 rounded-full text-sm font-medium text-white bg-[var(--accent)] transition-colors duration-200 shadow-[var(--shadow-sm)]"
          >
            选择文件
          </motion.span>
        </>
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
