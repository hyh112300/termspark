import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Maximize2 } from 'lucide-react';
import type { ImageRecord } from '@/types';
import { randomDecoration } from '@/lib/utils';
import CardDecoration from './CardDecoration';
import TermList from '@/components/terminology/TermList';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';

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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDelete = useCallback(() => {
    if (confirm('删除这张卡片？')) onDelete(image.id);
  }, [image.id, onDelete]);

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 4 - 2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative polaroid p-2 pb-3 rounded-sm w-[180px] shrink-0 group"
      >
        <CardDecoration decoration={decoration} />

        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden rounded-sm cursor-pointer bg-[var(--bg-secondary)]"
          onClick={() => setShowPreview(true)}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-[var(--bg-secondary)]" />
          )}
          <img
            src={`/uploads/${image.filename}`}
            alt={image.originalName}
            className={`w-full h-full object-cover transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* File name (handwritten style) */}
        <p className="mt-2 text-xs text-hand text-[var(--text-muted)] text-center truncate px-1">
          {image.originalName}
        </p>

        {/* Hover actions */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button variant="ghost" size="icon" className="!p-1 !h-7 !w-7 bg-white/80 dark:bg-black/40" onClick={() => setShowPreview(true)}>
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="!p-1 !h-7 !w-7 bg-white/80 dark:bg-black/40" onClick={() => onRegenerate(image.id)}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="!p-1 !h-7 !w-7 bg-white/80 dark:bg-black/40 text-red-500" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Term tags */}
        <div className="mt-2">
          <TermList terms={image.terms} onDeleteTerm={onDeleteTerm} />
        </div>
      </motion.div>

      {/* Full preview dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} title={image.originalName}>
        <div className="flex flex-col items-center gap-4">
          <img
            src={`/uploads/${image.filename}`}
            alt={image.originalName}
            className="max-w-full max-h-[60vh] rounded-lg object-contain"
          />
          <div className="flex flex-wrap gap-2 justify-center">
            <TermList terms={image.terms} onDeleteTerm={onDeleteTerm} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
