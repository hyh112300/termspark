import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import WeekHeader from '@/components/layout/WeekHeader';
import WeekGrid from '@/components/layout/WeekGrid';
import NotesRow from '@/components/layout/NotesRow';
import { useWeekNavigator } from '@/hooks/useWeekNavigator';
import { useImages, useNote } from '@/hooks/useApi';

const queryClient = new QueryClient();

function AppInner() {
  const {
    weekStart, weekNumber, dateRange,
    goToPrevWeek, goToNextWeek, goToCurrentWeek,
  } = useWeekNavigator();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const {
    images, loading, fetchImages,
    uploadImage, deleteImage, deleteTerm, regenerateTerms,
  } = useImages(weekStart);

  const { note, saving, fetchNote, saveNote } = useNote(weekStart);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Fetch data when week changes
  useEffect(() => {
    fetchImages();
    fetchNote();
  }, [weekStart]);

  const handleUpload = useCallback(async (file: File, dayOfWeek: number) => {
    try {
      await uploadImage(file, dayOfWeek);
      toast.success('图片上传成功，AI 正在生成术语...');
    } catch (err: any) {
      toast.error(`上传失败: ${err.message}`);
    }
  }, [uploadImage]);

  const handleDeleteImage = useCallback(async (id: number) => {
    try {
      await deleteImage(id);
      toast.success('卡片已删除');
    } catch (err: any) {
      toast.error(`删除失败: ${err.message}`);
    }
  }, [deleteImage]);

  const handleDeleteTerm = useCallback(async (termId: number) => {
    try {
      await deleteTerm(termId);
    } catch (err: any) {
      toast.error(`删除失败: ${err.message}`);
    }
  }, [deleteTerm]);

  const handleRegenerate = useCallback(async (imageId: number) => {
    try {
      await regenerateTerms(imageId);
      toast.success('术语已重新生成');
    } catch (err: any) {
      toast.error(`重新生成失败: ${err.message}`);
    }
  }, [regenerateTerms]);

  const handleSaveNote = useCallback(async (content: string) => {
    try {
      await saveNote(content);
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`);
    }
  }, [saveNote]);

  return (
    <div className="min-h-screen flex flex-col">
      <WeekHeader
        weekNumber={weekNumber}
        dateRange={dateRange}
        isDark={isDark}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
        onToggleDark={() => setIsDark(d => !d)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-3 min-h-[240px] animate-pulse">
                <div className="h-4 w-12 bg-[var(--border-color)]/30 rounded mb-3" />
                <div className="flex gap-2">
                  {[1, 2].map(j => (
                    <div key={j} className="w-[180px] h-[220px] bg-[var(--border-color)]/20 rounded-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <WeekGrid
            images={images}
            uploading={false}
            onUpload={handleUpload}
            onDeleteImage={handleDeleteImage}
            onDeleteTerm={handleDeleteTerm}
            onRegenerate={handleRegenerate}
          />
        )}

        <NotesRow
          initialContent={note?.content || ''}
          onSave={handleSaveNote}
          saving={saving}
        />
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
