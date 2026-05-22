import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ══════════════════════════════════
   Date utilities (remains backward compatible)
   ══════════════════════════════════ */

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getWeekNumber(d: Date): number {
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDays = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}

export function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('zh-CN', opts);
  const endStr = end.toLocaleDateString('zh-CN', opts);
  return `${startStr} — ${endStr}`;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export { formatDate as formatWeekStart };

/* ══════════════════════════════════
   Timeline / Day helpers
   ══════════════════════════════════ */

export function getTodayStr(): string {
  return formatDate(new Date());
}

export function getDayNames(): string[] {
  return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
}

export function getDayName(dayOfWeek: number): string {
  return getDayNames()[dayOfWeek] || '';
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

export function dateFromWeekStart(weekStart: string, dayOfWeek: number): string {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dayOfWeek);
  return formatDate(d);
}

export function groupImagesByDate(
  images: ImageRecord[],
  notes: Map<string, NoteRecord>
): DayGroup[] {
  const map = new Map<string, ImageRecord[]>();
  images.forEach(img => {
    const date = dateFromWeekStart(img.weekStart, img.dayOfWeek);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(img);
  });

  // Collect all unique dates and sort
  const dates = Array.from(map.keys()).sort();

  return dates.map(date => {
    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = (d.getDay() + 6) % 7; // 0=Mon
    return {
      date,
      dayOfWeek,
      dayName: getDayName(dayOfWeek),
      displayDate: formatDisplayDate(date),
      isToday: isToday(date),
      images: map.get(date) || [],
      note: notes.get(date) || null,
    };
  });
}

/* ══════════════════════════════════
   Decoration (simplified pastel)
   ══════════════════════════════════ */
const pastelColors = [
  'var(--pastel-pink)',
  'var(--pastel-green)',
  'var(--pastel-blue)',
  'var(--pastel-yellow)',
];

export function randomPastelColor(): string {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

export function randomDecoration() {
  return {
    type: 'pastel-dot' as const,
    color: randomPastelColor(),
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 10,
    size: Math.random() * 6 + 4,
  };
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

/* ── Re-import types locally to avoid circular deps ── */
import type { ImageRecord, NoteRecord, DayGroup } from '@/types';
