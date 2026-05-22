import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ImageRecord } from '@/types';
import ImageCard from '@/components/cards/ImageCard';
import ImageUploader from '@/components/cards/ImageUploader';
import { cn } from '@/lib/utils';

interface DayCellProps {
  dayIndex: number;
  dayName: string;
  images: ImageRecord[];
  uploading: boolean;
  onUpload: (file: File, dayOfWeek: number) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
  className?: string;
}

export default function DayCell({
  dayIndex, dayName, images, uploading,
  onUpload, onDeleteImage, onDeleteTerm, onRegenerate, className,
}: DayCellProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onUpload(file, dayIndex);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn(
      'flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-3 min-h-[240px]',
      className
    )}>
      {/* Day header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{dayName}</span>
        <span className="text-xs text-[var(--text-muted)]">
          {images.length > 0 && `${images.length} 张卡片`}
        </span>
      </div>

      {/* Image cards */}
      <div className="flex-1 flex flex-wrap gap-3 content-start overflow-y-auto">
        <AnimatePresence>
          {images.map(img => (
            <ImageCard
              key={img.id}
              image={img}
              onDelete={onDeleteImage}
              onDeleteTerm={onDeleteTerm}
              onRegenerate={onRegenerate}
            />
          ))}
        </AnimatePresence>

        {/* Uploader */}
        <ImageUploader onUpload={handleUpload} uploading={isUploading} />
      </div>
    </div>
  );
}
