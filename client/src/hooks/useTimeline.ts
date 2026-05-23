import { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageRecord, NoteRecord, DayGroup, TimelineResponse, TimelinePageResponse } from '@/types';
import { formatDate, getTodayStr, getDayName, formatDisplayDate, isToday, dateFromWeekStart } from '@/lib/utils';

const API_BASE = '/api';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildDayGroups(images: ImageRecord[], notesMap: Map<string, NoteRecord>): DayGroup[] {
  const map = new Map<string, ImageRecord[]>();
  images.forEach(img => {
    const date = dateFromWeekStart(img.weekStart, img.dayOfWeek);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(img);
  });

  const dates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
  return dates.map(date => {
    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = (d.getDay() + 6) % 7;
    return {
      date,
      dayOfWeek,
      dayName: getDayName(dayOfWeek),
      displayDate: formatDisplayDate(date),
      isToday: isToday(date),
      images: map.get(date) || [],
      note: notesMap.get(date) || null,
    };
  });
}

export function useTimeline() {
  const [days, setDays] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePast, setHasMorePast] = useState(false);
  const [hasMoreFuture, setHasMoreFuture] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  const pastCursorRef = useRef<string | null>(null);
  const futureCursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  // Initial load — around today
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<TimelineResponse>(
        `/images/timeline?around=${getTodayStr()}&limit=14`
      );
      const notesMap = new Map<string, NoteRecord>();

      // Fetch notes for all dates
      const dates = new Set<string>();
      data.items.forEach(img => {
        dates.add(dateFromWeekStart(img.weekStart, img.dayOfWeek));
      });

      for (const date of dates) {
        try {
          const note = await apiFetch<NoteRecord>(`/notes?date=${date}`);
          if (note && note.content) notesMap.set(date, note);
        } catch { /* no note */ }
      }

      const groups = buildDayGroups(data.items, notesMap);
      // Ensure today is always present even if no images
      const todayStr = getTodayStr();
      if (!groups.find(g => g.date === todayStr)) {
        const d = new Date();
        const dayOfWeek = (d.getDay() + 6) % 7;
        groups.push({
          date: todayStr,
          dayOfWeek,
          dayName: getDayName(dayOfWeek),
          displayDate: formatDisplayDate(todayStr),
          isToday: true,
          images: [],
          note: notesMap.get(todayStr) || null,
        });
        groups.sort((a, b) => b.date.localeCompare(a.date));
      }

      setDays(groups);
      setHasMorePast(data.hasMorePast);
      setHasMoreFuture(data.hasMoreFuture);
      pastCursorRef.current = data.pastCursor;
      futureCursorRef.current = data.futureCursor;
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Load more past
  const loadMorePast = useCallback(async () => {
    if (!pastCursorRef.current || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data = await apiFetch<TimelinePageResponse>(
        `/images/timeline?before=${pastCursorRef.current}&limit=14`
      );
      const notesMap = new Map<string, NoteRecord>();

      const dates = new Set<string>();
      data.items.forEach(img => {
        dates.add(dateFromWeekStart(img.weekStart, img.dayOfWeek));
      });
      for (const date of dates) {
        try {
          const note = await apiFetch<NoteRecord>(`/notes?date=${date}`);
          if (note && note.content) notesMap.set(date, note);
        } catch { /* no note */ }
      }

      const groups = buildDayGroups(data.items, notesMap);
      setDays(prev => [...prev, ...groups]);
      setHasMorePast(data.hasMore);
      pastCursorRef.current = data.hasMore ? data.nextCursor : null;
    } catch (err) {
      console.error('Failed to load more past:', err);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  // Load more future
  const loadMoreFuture = useCallback(async () => {
    if (!futureCursorRef.current || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data = await apiFetch<TimelinePageResponse>(
        `/images/timeline?after=${futureCursorRef.current}&limit=14`
      );
      const notesMap = new Map<string, NoteRecord>();

      const dates = new Set<string>();
      data.items.forEach(img => {
        dates.add(dateFromWeekStart(img.weekStart, img.dayOfWeek));
      });
      for (const date of dates) {
        try {
          const note = await apiFetch<NoteRecord>(`/notes?date=${date}`);
          if (note && note.content) notesMap.set(date, note);
        } catch { /* no note */ }
      }

      const groups = buildDayGroups(data.items, notesMap);
      setDays(prev => [...groups, ...prev]);
      setHasMoreFuture(data.hasMore);
      futureCursorRef.current = data.hasMore ? data.nextCursor : null;
    } catch (err) {
      console.error('Failed to load more future:', err);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    const el = document.getElementById(`day-${getTodayStr()}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  // Upload image
  const uploadImage = useCallback(async (file: File) => {
    const today = getTodayStr();
    const formData = new FormData();
    formData.append('image', file);
    formData.append('date', today);

    const res = await fetch(`${API_BASE}/images`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    // Refresh to get updated data
    await refresh();
    return data;
  }, [refresh]);

  // Delete image
  const deleteImage = useCallback(async (id: number) => {
    await apiFetch(`/images/${id}`, { method: 'DELETE' });
    setDays(prev => prev
      .map(day => ({
        ...day,
        images: day.images.filter(img => img.id !== id),
      }))
      .filter(day => day.images.length > 0 || day.isToday));
  }, []);

  // Delete term
  const deleteTerm = useCallback(async (termId: number) => {
    await apiFetch(`/terms/${termId}`, { method: 'DELETE' });
    setDays(prev => prev.map(day => ({
      ...day,
      images: day.images.map(img => ({
        ...img,
        terms: img.terms.filter(t => t.id !== termId),
      })),
    })));
  }, []);

  // Regenerate terms
  const regenerateTerms = useCallback(async (imageId: number) => {
    const data = await apiFetch<{ terms: any[] }>(`/images/${imageId}/regenerate`, { method: 'POST' });
    setDays(prev => prev.map(day => ({
      ...day,
      images: day.images.map(img =>
        img.id === imageId ? { ...img, terms: data.terms } : img
      ),
    })));
  }, []);

  // Save note
  const saveNote = useCallback(async (date: string, content: string) => {
    setNoteSaving(true);
    try {
      await apiFetch<NoteRecord>('/notes', {
        method: 'PUT',
        body: JSON.stringify({ date, content }),
      });
      setDays(prev => prev.map(day =>
        day.date === date
          ? { ...day, note: { date, content } as NoteRecord }
          : day
      ));
    } catch (err: any) {
      throw err;
    } finally {
      setNoteSaving(false);
    }
  }, []);

  return {
    days,
    loading,
    loadingMore,
    hasMorePast,
    hasMoreFuture,
    loadMorePast,
    loadMoreFuture,
    scrollToToday,
    refresh,
    uploadImage,
    deleteImage,
    deleteTerm,
    regenerateTerms,
    saveNote,
    noteSaving,
  };
}
