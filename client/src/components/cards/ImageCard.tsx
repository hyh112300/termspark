import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';
import type { ImageRecord, TermRecord } from '@/types';
import { copyToClipboard } from '@/lib/utils';
import TermTag from '@/components/terminology/TermTag';
import Dialog from '@/components/ui/Dialog';

/* ── ImageCard ── */
interface ImageCardProps {
  image: ImageRecord;
  onDelete: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
}

export default function ImageCard({ image, onDelete, onDeleteTerm, onRegenerate }: ImageCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleDelete = useCallback(() => onDelete(image.id), [image.id, onDelete]);
  const handleRegenerate = useCallback(() => onRegenerate(image.id), [image.id, onRegenerate]);

  const showCount = hovered ? image.terms.length : 3;
  const termsToShow = image.terms.slice(0, showCount);
  const remaining = image.terms.length - showCount;

  return (
    <>
      <div
        className="img-card-horizontal group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image thumbnail */}
        <div
          className="relative w-24 sm:w-28 aspect-4/3 shrink-0 rounded-lg overflow-hidden cursor-pointer bg-[var(--bg-base)]"
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

          {/* Action buttons on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
                  className="p-1.5 rounded-full bg-white/80 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors shadow-sm"
                  title="重新生成"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="p-1.5 rounded-full bg-white/80 text-[var(--text-secondary)] hover:text-red-500 transition-colors shadow-sm"
                  title="删除图片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* File name */}
          <p className="text-[13px] font-medium text-[var(--text-secondary)] truncate leading-tight">
            {image.originalName}
          </p>

          {/* Term tags */}
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {termsToShow.map(t => (
                <TermTag
                  key={t.id}
                  term={t.term}
                  onDelete={() => onDeleteTerm(t.id)}
                />
              ))}
            </AnimatePresence>
            {!hovered && remaining > 0 && (
              <span className="text-[11px] text-[var(--text-tertiary)] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-hover)]">
                +{remaining}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)}>
        <div className="flex flex-col items-center gap-4">
          <img
            src={`/uploads/${image.filename}`}
            alt={image.originalName}
            className="max-w-full max-h-[70vh] rounded object-contain bg-[var(--bg-base)]"
          />
          <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
            {image.terms.map(t => (
              <span key={t.id} className="term-tag text-[13px]">{t.term}</span>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
