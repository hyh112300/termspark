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
  date: string;
  content: string;
  updatedAt?: string;
}

export interface NoteSaveRequest {
  date: string;
  content: string;
}

export interface DayGroup {
  date: string;          // YYYY-MM-DD
  dayOfWeek: number;     // 0=Mon ... 6=Sun
  dayName: string;       // "周四"
  displayDate: string;   // "5月22日"
  isToday: boolean;
  images: ImageRecord[];
  note: NoteRecord | null;
}

export interface TimelineResponse {
  items: ImageRecord[];
  hasMorePast: boolean;
  hasMoreFuture: boolean;
  pastCursor: string;
  futureCursor: string;
}

export interface TimelinePageResponse {
  items: ImageRecord[];
  hasMore: boolean;
  nextCursor: string;
}

export interface SearchResponse {
  items: ImageRecord[];
  total: number;
}

export interface DecorationStyle {
  type: 'pastel-dot';
  color: string;
  x: number;
  y: number;
  size: number;
}

export type { NoteRecord as LegacyNoteRecord };
