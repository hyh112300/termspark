import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ImageRecord } from '@/types';
import ImageCard from '@/components/cards/ImageCard';
import ImageUploader from '@/components/cards/ImageUploader';
import DateMarker from './DateMarker';

interface DaySectionProps {
  date: string;
  dayName: string;
  displayDate: string;
  isToday: boolean;
  images: ImageRecord[];
  onUpload: (file: File) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
  onPreview: (url: string) => void;
  uploading: boolean;
  regeneratingId: number | null;
}

export default function DaySection({
  date,
  dayName,
  displayDate,
  isToday,
  images,
  onUpload,
  onDeleteImage,
  onDeleteTerm,
  onRegenerate,
  onPreview,
  uploading,
  regeneratingId,
}: DaySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed(c => !c);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mb-6 sm:mb-8"
    >
      {/* Timeline connector for md+ */}
      <div className="hidden md:block absolute left-[14px] top-8 bottom-0 w-px bg-[var(--timeline-line)] pointer-events-none" />

      <div className="md:flex md:gap-4">
        {/* Date marker — on md+, sits to the left */}
        <div className="md:w-32 shrink-0 md:pt-0.5">
          <DateMarker
            date={date}
            dayName={dayName}
            displayDate={displayDate}
            isToday={isToday}
            imageCount={images.length}
            collapsed={collapsed}
            onToggle={handleToggle}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Image cards grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {images.map(img => (
                      <ImageCard
                        key={img.id}
                        image={img}
                        onDelete={onDeleteImage}
                        onDeleteTerm={onDeleteTerm}
                        onRegenerate={onRegenerate}
                        onPreview={onPreview}
                        regenerating={regeneratingId === img.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[var(--text-tertiary)] text-sm">
                    今天还没有记录 ✨
                  </div>
                )}

                {/* Upload — only on today */}
                {isToday && (
                  <div className="mb-4">
                    <ImageUploader onFiles={(files) => files.forEach(f => onUpload(f))} uploading={uploading} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
