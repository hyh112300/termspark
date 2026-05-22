import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';
import type { ImageRecord, TermRecord } from '@/types';
import { randomDecoration, copyToClipboard } from '@/lib/utils';
import CardDecoration from './CardDecoration';
import Dialog from '@/components/ui/Dialog';

/* ── Term tag ── */
function TermOverlay({ term, onDelete }: { term: TermRecord; onDelete: (id: number) => void }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(term.term);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 3, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className="tag-pill text-left truncate max-w-full backdrop-blur-md bg-white/75 dark:bg-[#1f1a15]/75 shadow-sm"
      onClick={handleClick}
      title="点击复制"
    >
      <span className="truncate text-[11px]">{term.term}</span>
      {copied && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[9px] text-(--warm-amber) font-sans shrink-0"
        >✓</motion.span>
      )}
      <button
        className="p-1 rounded-full hover:bg-(--warm-rose)/30 text-(--warm-rose)/60 hover:text-(--warm-rose) transition-colors shrink-0"
        onClick={(e) => { e.stopPropagation(); onDelete(term.id); }}
        title="删除术语"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
    </motion.button>
  );
}

/* ── ImageCard ── */
interface ImageCardProps {
  image: ImageRecord;
  onDelete: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
}

export default function ImageCard({ image, onDelete, onDeleteTerm, onRegenerate }: ImageCardProps) {
  const [decoration] = useState(() => randomDecoration());
  const [showPreview, setShowPreview] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleDelete = useCallback(() => {
    if (confirm('删除这张卡片？')) onDelete(image.id);
  }, [image.id, onDelete]);

  const showCount = hovered ? image.terms.length : 2;
  const termsToShow = image.terms.slice(0, showCount);
  const remaining = image.terms.length - showCount;

  return (
    <>
      <div
        className="relative w-35 sm:w-40 shrink-0 hover:z-40"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="polaroid rounded-xs">
          <CardDecoration decoration={decoration} />

          {/* Image */}
          <div
            className="relative aspect-4/3 overflow-hidden rounded-[1px] cursor-pointer bg-(--paper-dark)"
            onClick={() => setShowPreview(true)}
          >
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={`/uploads/${image.filename}`}
              alt={image.originalName}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />

            {/* Gradient backdrop */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Action buttons — large click targets */}
            {hovered && (
              <div className="absolute top-1.5 right-1.5 z-30 flex gap-1">
                <button
                  onClick={() => onRegenerate(image.id)}
                  className="p-2 rounded-full bg-white/75 dark:bg-[#1f1a15]/75 backdrop-blur-md shadow-sm text-(--text-muted) hover:text-(--warm-amber) transition-colors hover:scale-110 active:scale-95"
                  title="重新生成"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-white/75 dark:bg-[#1f1a15]/75 backdrop-blur-md shadow-sm text-(--text-muted) hover:text-(--warm-rust) transition-colors hover:scale-110 active:scale-95"
                  title="删除图片"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          <p className="mt-1.5 text-[11px] text-hand text-(--text-muted) text-center truncate px-1 leading-none">
            {image.originalName}
          </p>
        </div>

        {/* Terms — absolute, out of flow, top-left, expand downward */}
        <div className="absolute left-1.5 right-1.5 z-20 flex flex-col gap-0.5 items-start pointer-events-none"
          style={{ top: '8px' }}
        >
          <AnimatePresence>
            {termsToShow.map((t) => (
              <div key={t.id} className="w-full max-w-full pointer-events-auto">
                <TermOverlay term={t} onDelete={onDeleteTerm} />
              </div>
            ))}
          </AnimatePresence>
          {!hovered && remaining > 0 && (
            <span className="tag-count text-[10px] px-1.5 py-0.5 pointer-events-auto">+{remaining}</span>
          )}
        </div>
      </div>

      {/* Preview dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)}>
        <div className="flex flex-col items-center gap-4">
          <img
            src={`/uploads/${image.filename}`}
            alt={image.originalName}
            className="max-w-full max-h-[70vh] rounded object-contain bg-(--paper-dark)"
          />
          <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
            {image.terms.map(t => (
              <span key={t.id} className="tag-pill text-[11px]">{t.term}</span>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
