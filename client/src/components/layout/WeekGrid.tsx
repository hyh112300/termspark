import type { ImageRecord } from '@/types';
import DayCell from './DayCell';
import { dayNames } from '@/lib/utils';

interface WeekGridProps {
  images: ImageRecord[];
  uploading: boolean;
  onUpload: (file: File, dayOfWeek: number) => Promise<void>;
  onDeleteImage: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
}

export default function WeekGrid({
  images, uploading, onUpload, onDeleteImage, onDeleteTerm, onRegenerate,
}: WeekGridProps) {
  const names = dayNames();

  const getImagesForDay = (dayIndex: number) =>
    images.filter(img => img.dayOfWeek === dayIndex);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Row 1: Mon, Tue, Wed */}
      {[0, 1, 2].map(dayIndex => (
        <DayCell
          key={dayIndex}
          dayIndex={dayIndex}
          dayName={names[dayIndex]}
          images={getImagesForDay(dayIndex)}
          uploading={uploading}
          onUpload={onUpload}
          onDeleteImage={onDeleteImage}
          onDeleteTerm={onDeleteTerm}
          onRegenerate={onRegenerate}
        />
      ))}

      {/* Row 2: Thu, Fri, Weekend (merged) */}
      <DayCell
        dayIndex={3}
        dayName={names[3]}
        images={getImagesForDay(3)}
        uploading={uploading}
        onUpload={onUpload}
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
      />
      <DayCell
        dayIndex={4}
        dayName={names[4]}
        images={getImagesForDay(4)}
        uploading={uploading}
        onUpload={onUpload}
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
      />
      <DayCell
        dayIndex={5}
        dayName={names[5]}
        images={[...getImagesForDay(5), ...getImagesForDay(6)]}
        uploading={uploading}
        onUpload={(file) => onUpload(file, 5)} // Weekend goes to Saturday slot
        onDeleteImage={onDeleteImage}
        onDeleteTerm={onDeleteTerm}
        onRegenerate={onRegenerate}
        className="col-span-1"
      />
    </div>
  );
}
