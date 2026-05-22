export interface ImageRecord {
  id: number;
  filename: string;
  originalName: string;
  weekStart: string;
  dayOfWeek: number;
  createdAt: string;
  terms: TermRecord[];
}

export interface TermRecord {
  id: number;
  imageId: number;
  term: string;
  createdAt: string;
}

export interface NoteRecord {
  id?: number;
  weekStart: string;
  content: string;
  updatedAt?: string;
}

export interface WeekData {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  images: ImageRecord[];
  note: NoteRecord | null;
}

export type DecorationType = 'washi-green' | 'washi-pink' | 'washi-blue' | 'pin-red' | 'pin-blue' | 'clip' | 'tape-cream' | 'tape-grid';

export interface Decoration {
  type: DecorationType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number; // degrees
}
