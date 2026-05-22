import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ImageRecord, NoteRecord, DecorationStyle } from '@/types';
import ImageCard from '@/components/cards/ImageCard';
import ImageUploader from '@/components/cards/ImageUploader';
import CardDecoration from '@/components/cards/CardDecoration';
import DateMarker from './DateMarker';
import DayNote from './DayNote';
import { randomDecoration } from '@/lib/utils';

interface DaySectionProps {
  date: string;
  dayName: string;
  displayDate: string;
  isToday: boolean;
  images: ImageRecord[];
  note: NoteRecord | null;
  onUpload: (file: File) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
  onSaveNote: (content: string) => Promise<void>;
  noteSaving: boolean;
  uploading: boolean;
}

export default function DaySection({
  date,
  dayName,
  displayDate,
  isToday,
  images,
  note,
  onUpload,
  onDeleteImage,
  onDeleteTerm,
  onRegenerate,
  onSaveNote,
  noteSaving,
  uploading,
}: DaySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [decoration] = useState<DecorationStyle>(() => randomDecoration());

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
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    {images.map(img => (
                      <div key={img.id} className="relative">
                        <CardDecoration decoration={decoration} />
                        <ImageCard
                          image={img}
                          onDelete={onDeleteImage}
                          onDeleteTerm={onDeleteTerm}
                          onRegenerate={onRegenerate}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[var(--text-tertiary)] text-sm">
                    今天还没有记录 ✨
                  </div>
                )}

                {/* Upload */}
                <div className="mb-4">
                  <ImageUploader onUpload={onUpload} uploading={uploading} />
                </div>

                {/* Note */}
                <DayNote
                  content={note?.content || ''}
                  onSave={onSaveNote}
                  saving={noteSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
