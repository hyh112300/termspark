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
  onUpload: (file: File, dayOfWeek: number) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
  className?: string;
  isWeekend?: boolean;
}

export default function DayCell({
  dayIndex, dayName, images,
  onUpload, onDeleteImage, onDeleteTerm, onRegenerate, className,
  isWeekend,
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
      'flex flex-col rounded-lg p-2.5 sm:p-3 pt-0 min-h-40 sm:min-h-50',
      'panel-glass',
      className
    )}>
      {/* Day header — tab */}
      <div className="flex justify-center">
        <div className={isWeekend ? 'day-tab day-tab-weekend' : 'day-tab'}>
          <span>{dayName}</span>
          {images.length > 0 && (
            <span className="text-[10px] opacity-70 font-sans font-normal">
              {images.length}
            </span>
          )}
        </div>
      </div>

      {/* Content — overflow-visible so absolute terms can spill out */}
      <div className="flex-1 flex flex-wrap gap-2 sm:gap-2.5 content-start pt-2.5">
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

        <ImageUploader onUpload={handleUpload} uploading={isUploading} />
      </div>
    </div>
  );
}
