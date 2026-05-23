import { Upload, Loader2 } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  uploading?: boolean;
}

export default function DropZone({ onFiles, uploading }: DropZoneProps) {
  const [over, setOver] = useState(false);
  const dragCount = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imgs.length) onFiles(imgs);
    },
    [onFiles],
  );

  // Global paste listener
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) onFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles]);

  return (
    <motion.div
      whileHover={!over && !uploading ? { scale: 1.01 } : {}}
      animate={over ? { scale: 1.03 } : { scale: 1 }}
      onClick={() => !uploading && inputRef.current?.click()}
      onDragEnter={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        dragCount.current++;
        setOver(true);
      }}
      onDragLeave={() => {
        dragCount.current--;
        if (dragCount.current <= 0) setOver(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCount.current = 0;
        setOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative paper-card cursor-pointer overflow-hidden transition-colors ${
        over ? "ring-2 ring-primary" : ""
      } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      style={{
        borderStyle: "dashed",
        borderWidth: 2,
        backgroundColor: over
          ? "oklch(from var(--color-primary) l c h / 0.06)"
          : undefined,
      }}
    >
      {/* Washi tape accents */}
      <div
        className="washi-tape"
        style={{
          top: -8,
          left: 30,
          width: 90,
          transform: "rotate(-4deg)",
        }}
      />
      <div
        className="washi-tape"
        style={{
          top: -8,
          right: 30,
          width: 70,
          transform: "rotate(5deg)",
          background: "var(--color-washi-pink)",
        }}
      />

      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <motion.div
          animate={over ? { y: -4 } : { y: 0 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
            over
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </motion.div>

        {uploading ? (
          <>
            <p className="font-hand text-2xl text-foreground">
              AI 正在解析…
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              提取设计术语中
            </p>
          </>
        ) : over ? (
          <>
            <p className="font-hand text-2xl text-primary">
              松开以收藏这份灵感
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              就放这里吧～
            </p>
          </>
        ) : (
          <>
            <p className="font-hand text-2xl text-foreground">
              贴一张<span className="ink-underline">设计截图</span>到这里
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              拖拽 · 粘贴 · 或点击选择
            </p>
            <button className="mt-4 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm hover:shadow-md transition-shadow">
              选择文件
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
