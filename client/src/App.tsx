import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';
import TimelineFeed from '@/components/layout/TimelineFeed';
import DaySection from '@/components/layout/DaySection';
import SearchPanel from '@/components/layout/SearchPanel';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import { useTimeline } from '@/hooks/useTimeline';
import { formatDate, getTodayStr } from '@/lib/utils';
import type { ImageRecord } from '@/types';

const queryClient = new QueryClient();

function AppInner() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  const timelineRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useTimeline();

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Handle paste (screenshot upload)
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          try {
            await uploadImage(file);
            toast.success('粘贴截图成功，AI 正在生成术语...');
          } catch (err: any) {
            toast.error(`上传失败: ${err.message}`);
          }
        }
        break;
      }
    }
  }, [uploadImage]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Hide FAB when at bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setFabVisible(scrollBottom < docHeight - 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchResultClick = useCallback((image: ImageRecord) => {
    setSearchOpen(false);
    // Scroll to the day section containing this image
    const el = document.getElementById(`day-${formatDate(new Date(image.weekStart + 'T00:00:00'))}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleUpload = useCallback(async (date: string, file: File) => {
    setUploadingStates(prev => ({ ...prev, [date]: true }));
    try {
      await uploadImage(file);
      toast.success('图片上传成功，AI 正在生成术语...');
    } catch (err: any) {
      toast.error(`上传失败: ${err.message}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [date]: false }));
    }
  }, [uploadImage]);

  const handleDeleteImage = useCallback(async (id: number) => {
    if (!confirm('删除这张卡片？')) return;
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

  const handleSaveNote = useCallback(async (date: string, content: string) => {
    try {
      await saveNote(date, content);
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`);
    }
  }, [saveNote]);

  return (
    <div className="min-h-screen flex flex-col" ref={timelineRef}>
      <AppHeader
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        onSearch={() => setSearchOpen(true)}
        onToday={scrollToToday}
      />

      <main className="flex-1">
        <TimelineFeed
          loading={loading}
          loadingMore={loadingMore}
          hasMorePast={hasMorePast}
          hasMoreFuture={hasMoreFuture}
          onLoadMorePast={loadMorePast}
          onLoadMoreFuture={loadMoreFuture}
        >
          {days.map(day => (
            <div key={day.date} id={`day-${day.date}`}>
              <DaySection
                date={day.date}
                dayName={day.dayName}
                displayDate={day.displayDate}
                isToday={day.isToday}
                images={day.images}
                note={day.note}
                onUpload={(file) => handleUpload(day.date, file)}
                onDeleteImage={handleDeleteImage}
                onDeleteTerm={handleDeleteTerm}
                onRegenerate={handleRegenerate}
                onSaveNote={(content) => handleSaveNote(day.date, content)}
                noteSaving={noteSaving}
                uploading={!!uploadingStates[day.date]}
              />
            </div>
          ))}
        </TimelineFeed>
      </main>

      <FloatingActionButton
        visible={fabVisible}
        onClick={() => {
          const todayEl = document.getElementById(`day-${getTodayStr()}`);
          if (todayEl) {
            todayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResultClick={handleSearchResultClick}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '0.5px solid var(--border)',
            backdropFilter: 'blur(20px)',
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
