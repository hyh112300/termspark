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
      whileHover={{ scale: 1.03 }}
      className={`upload-zone w-[100px] ${dragover ? '!border-(--warm-amber) !opacity-80' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-1.5 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-(--warm-amber)" />
          <span className="text-[10px] text-(--text-muted) text-hand">分析中...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-4">
          <Camera className="w-4 h-4 text-(--text-muted)" />
          <span className="text-[10px] text-hand text-(--text-muted) leading-tight text-center px-1">
            粘贴截图
          </span>
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
