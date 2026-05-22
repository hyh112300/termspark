import { useState, useCallback } from 'react';
import type { ImageRecord, NoteRecord } from '@/types';

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

export function useImages(weekStart: string) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ImageRecord[]>(`/images?weekStart=${weekStart}`);
      setImages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  const uploadImage = useCallback(async (file: File, dayOfWeek: number) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('weekStart', weekStart);
    formData.append('dayOfWeek', String(dayOfWeek));

    const res = await fetch(`${API_BASE}/images`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    setImages(prev => [data.image ? { ...data.image, terms: data.terms } : data, ...prev]);
    return data;
  }, [weekStart]);

  const deleteImage = useCallback(async (id: number) => {
    await apiFetch(`/images/${id}`, { method: 'DELETE' });
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const deleteTerm = useCallback(async (termId: number) => {
    await apiFetch(`/terms/${termId}`, { method: 'DELETE' });
    setImages(prev => prev.map(img => ({
      ...img,
      terms: img.terms.filter(t => t.id !== termId),
    })));
  }, []);

  const regenerateTerms = useCallback(async (imageId: number) => {
    const data = await apiFetch<{ terms: any[] }>(`/images/${imageId}/regenerate`, { method: 'POST' });
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, terms: data.terms } : img
    ));
    return data;
  }, []);

  return { images, loading, error, fetchImages, uploadImage, deleteImage, deleteTerm, regenerateTerms };
}

export function useNote(weekStart: string) {
  const [note, setNote] = useState<NoteRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNote = useCallback(async () => {
    try {
      const data = await apiFetch<NoteRecord>(`/notes?weekStart=${weekStart}`);
      setNote(data);
    } catch {}
  }, [weekStart]);

  const saveNote = useCallback(async (content: string) => {
    setSaving(true);
    try {
      const data = await apiFetch<NoteRecord>('/notes', {
        method: 'PUT',
        body: JSON.stringify({ weekStart, content }),
      });
      setNote(data);
    } catch (err: any) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [weekStart]);

  return { note, saving, fetchNote, saveNote };
}
