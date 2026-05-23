import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import TimelineFeed from "@/components/layout/TimelineFeed";
import DaySection from "@/components/layout/DaySection";
import SearchPanel from "@/components/layout/SearchPanel";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { ImagePreview } from "@/components/layout/ImagePreview";
import { useTimeline } from "@/hooks/useTimeline";
import { getTodayStr } from "@/lib/utils";
import { GlobalLoadingProvider, useGlobalLoading } from "@/components/ui/LoadingOverlay";
import type { ImageRecord } from "@/types";

const queryClient = new QueryClient();

function AppInner() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingStates, setUploadingStates] = useState<
    Record<string, boolean>
  >({});
  const [regenId, setRegenId] = useState<number | null>(null);

  const {
    days,
    loading,
    loadingMore,
    hasMorePast,
    hasMoreFuture,
    loadMorePast,
    loadMoreFuture,
    scrollToToday,
    uploadImage,
    deleteImage,
    deleteTerm,
    regenerateTerms,
  } = useTimeline();

  const { show, hide } = useGlobalLoading();
  const isUploading = Object.values(uploadingStates).some(Boolean);

  useEffect(() => {
    if (regenId !== null || isUploading) show();
    else hide();
  }, [regenId, isUploading, show, hide]);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("termspark-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Hide FAB when at bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setFabVisible(scrollBottom < docHeight - 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchResultClick = useCallback((_image: ImageRecord) => {
    setSearchOpen(false);
    const el = document.getElementById(`day-${getTodayStr()}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleUpload = useCallback(
    async (date: string, file: File) => {
      setUploadingStates((prev) => ({ ...prev, [date]: true }));
      try {
        await uploadImage(file);
        toast.success("已收藏 ✿");
      } catch (err: any) {
        toast.error(err?.message || "上传失败");
      } finally {
        setUploadingStates((prev) => ({ ...prev, [date]: false }));
      }
    },
    [uploadImage],
  );

  const handleDeleteImage = useCallback(
    async (id: number) => {
      try {
        await deleteImage(id);
      } catch (err: any) {
        toast.error(`删除失败: ${err.message}`);
      }
    },
    [deleteImage],
  );

  const handleDeleteTerm = useCallback(
    async (termId: number) => {
      try {
        await deleteTerm(termId);
      } catch {}
    },
    [deleteTerm],
  );

  const handleRegenerate = useCallback(
    async (imageId: number) => {
      setRegenId(imageId);
      try {
        await regenerateTerms(imageId);
        toast.success("已重新解析");
      } catch (err: any) {
        toast.error(err?.message || "失败");
      } finally {
        setRegenId(null);
      }
    },
    [regenerateTerms],
  );

  return (
    <div className="min-h-screen">
      <AppHeader
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        onSearch={() => setSearchOpen(true)}
        onToday={scrollToToday}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 relative">
        {/* Hero */}
        <div className="mb-10 text-center relative">
          <div
            className="washi-tape hidden sm:block"
            style={{
              top: -12,
              left: "calc(50% - 60px)",
              width: 120,
            }}
          />
          <h2 className="font-hand text-4xl sm:text-5xl text-foreground leading-tight">
            你的<span className="ink-underline">设计灵感</span>手帐
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            粘贴一张设计截图，AI 自动提取设计术语关键词
          </p>
        </div>

        {/* Timeline */}
        <TimelineFeed
          loading={loading}
          loadingMore={loadingMore}
          hasMorePast={hasMorePast}
          hasMoreFuture={hasMoreFuture}
          onLoadMorePast={loadMorePast}
          onLoadMoreFuture={loadMoreFuture}
        >
          {days.map((day) => (
            <div key={day.date} id={`day-${day.date}`}>
              <DaySection
                date={day.date}
                dayName={day.dayName}
                displayDate={day.displayDate}
                isToday={day.isToday}
                images={day.images}
                onUpload={(file) => handleUpload(day.date, file)}
                onDeleteImage={handleDeleteImage}
                onDeleteTerm={handleDeleteTerm}
                onRegenerate={handleRegenerate}
                onPreview={setPreviewUrl}
                uploading={!!uploadingStates[day.date]}
                regeneratingId={regenId}
              />
            </div>
          ))}
        </TimelineFeed>

        {!loading && days.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-12">
            提示：你可以直接{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-card mx-1">
              Ctrl/⌘ + V
            </kbd>{" "}
            粘贴截图到任何位置
          </p>
        )}
      </main>

      {/* Floating action button */}
      <FloatingActionButton
        visible={fabVisible}
        onClick={scrollToToday}
      />

      {/* Toast */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-hand)",
            fontSize: "1.1rem",
          },
        }}
      />

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResultClick={handleSearchResultClick}
      />
      <ImagePreview url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingProvider>
        <AppInner />
      </GlobalLoadingProvider>
    </QueryClientProvider>
  );
}
