import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function formatWeekStart(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function dayNames(): string[] {
  return ['周一', '周二', '周三', '周四', '周五', '周末'];
}

const decorations = [
  { type: 'washi-green' as const, x: 20, y: -8, rotation: -3 },
  { type: 'washi-pink' as const, x: 70, y: -6, rotation: 2 },
  { type: 'washi-blue' as const, x: 45, y: -10, rotation: -5 },
  { type: 'pin-red' as const, x: 50, y: 5, rotation: 0 },
  { type: 'pin-blue' as const, x: 30, y: 3, rotation: 0 },
  { type: 'clip' as const, x: 85, y: -2, rotation: 8 },
  { type: 'tape-cream' as const, x: 15, y: -5, rotation: -2 },
  { type: 'tape-grid' as const, x: 55, y: -7, rotation: 3 },
];

export function randomDecoration() {
  return decorations[Math.floor(Math.random() * decorations.length)];
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}
