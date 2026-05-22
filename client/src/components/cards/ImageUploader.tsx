import { useCallback, useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      className={cn(
        'relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
        dragover
          ? 'border-(--accent) bg-(--accent)/5'
          : 'border-(--border-color) hover:border-(--accent)/50'
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="w-6 h-6 animate-spin text-(--accent)" />
          <span className="text-xs text-(--text-muted)">AI 正在分析...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-4">
          <Upload className="w-5 h-5 text-(--text-muted)" />
          <span className="text-xs text-hand text-(--text-muted)">拖拽或点击上传</span>
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
