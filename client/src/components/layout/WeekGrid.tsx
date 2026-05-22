import type { ImageRecord } from '@/types';
import DayCell from './DayCell';
import { dayNames } from '@/lib/utils';

interface WeekGridProps {
  images: ImageRecord[];
  onUpload: (file: File, dayOfWeek: number) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
}

export default function WeekGrid({
  images, onUpload, onDeleteImage, onDeleteTerm, onRegenerate,
}: WeekGridProps) {
  const names = dayNames();

  const getImagesForDay = (dayIndex: number) =>
    images.filter(img => img.dayOfWeek === dayIndex);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
      {/* Row 1: Mon, Tue, Wed */}
      {[0, 1, 2].map(dayIndex => (
        <DayCell
          key={dayIndex}
          dayIndex={dayIndex}
          dayName={names[dayIndex]}
          images={getImagesForDay(dayIndex)}
          onUpload={onUpload}
          onDeleteImage={onDeleteImage}
          onDeleteTerm={onDeleteTerm}
          onRegenerate={onRegenerate}
        />
      ))}

      {/* Row 2: Thu, Fri, Weekend */}
      <DayCell
        dayIndex={3}
        dayName={names[3]}
        images={getImagesForDay(3)}
        onUpload={onUpload}
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
      />
      <DayCell
        dayIndex={4}
        dayName={names[4]}
        images={getImagesForDay(4)}
        onUpload={onUpload}
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
      />
      <DayCell
        dayIndex={5}
        dayName={names[5]}
        images={[...getImagesForDay(5), ...getImagesForDay(6)]}
        onUpload={(file) => onUpload(file, 5)}
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
        isWeekend
      />
    </div>
  );
}
