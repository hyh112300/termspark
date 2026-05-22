import { useState, useCallback, useMemo } from 'react';
import { Trash2, RefreshCw, Eye } from 'lucide-react';
import type { ImageRecord } from '@/types';
import Dialog from '@/components/ui/Dialog';
import { copyToClipboard } from '@/lib/utils';

/* ── Decorative blur circle configs for back face ── */
const blurCircles = [
  { size: 100, x: -10, y: -15, color: 'var(--pastel-pink)' },
  { size: 70, x: 55, y: 30, color: 'var(--pastel-blue)' },
  { size: 50, x: 20, y: 55, color: 'var(--pastel-green)' },
  { size: 80, x: 65, y: -5, color: 'var(--pastel-yellow)' },
];

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

  const handleDelete = useCallback(() => onDelete(image.id), [image.id, onDelete]);
  const handleRegenerate = useCallback(() => onRegenerate(image.id), [image.id, onRegenerate]);

  /* Stable random offset for blur circles per image instance */
  const circleOffsets = useMemo(() =>
    blurCircles.map(c => ({
      ...c,
      x: c.x + (image.id * 7 % 25),
      y: c.y + (image.id * 13 % 25),
    })),
  [image.id]);

  return (
    <>
      <div className="flip-card group">
        <div className="flip-card-inner">
          {/* ═══ Front: Image ═══ */}
          <div className="flip-card-front">
            {/* Image */}
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={`/uploads/${image.filename}`}
              alt={image.originalName}
              className={`transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onClick={() => setShowPreview(true)}
            />

            {/* Gradient overlay */}
            <div className="flip-card-front-overlay" />

            {/* Glass badge — filename */}
            <div className="flip-card-badge">
              <span className="flip-card-badge-text">{image.originalName}</span>
            </div>

            {/* Actions on hover (front) */}
            <div className="flip-card-actions">
              <button
                onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
                className="flip-card-action-btn regenerate"
                title="重新生成"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
                className="flip-card-action-btn"
                title="预览大图"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ═══ Back: Terms ═══ */}
          <div className="flip-card-back">
            {/* Rotating glow border — via ::before */}
            <div className="flip-card-back-content">
              {/* Blur circles decoration */}
              {circleOffsets.map((c, i) => (
                <div
                  key={i}
                  className="flip-card-blur-circle"
                  style={{
                    width: c.size,
                    height: c.size,
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    background: c.color,
                  }}
                />
              ))}

              {/* Delete button — top-right, always visible on back */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/50 hover:text-red-300 transition-all"
                title="删除图片"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* Title */}
              <div className="relative z-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                术语 · {image.terms.length}
              </div>

              {/* Terms — white compact pills, horizontal wrap */}
              <div className="relative z-1 flex flex-wrap content-start gap-1.5">
                {image.terms.map(t => (
                  <span
                    key={t.id}
                    onClick={() => copyToClipboard(t.term)}
                    className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium leading-tight text-white/85 bg-white/12 cursor-pointer transition-all hover:bg-white/22 hover:scale-105 active:scale-95 select-none shrink-0"
                    title="点击复制"
                  >
                    {t.term}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteTerm(t.id); }}
                      className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity shrink-0"
                      title="删除"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 2l6 6M8 2l-6 6" />
                      </svg>
                    </button>
                  </span>
                ))}
                {image.terms.length === 0 && (
                  <span className="text-white/25 text-sm mt-2">暂无术语</span>
                )}
              </div>
            </div>
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
