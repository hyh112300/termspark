import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import TimelineFeed from "@/components/layout/TimelineFeed";
import DaySection from "@/components/layout/DaySection";
import SearchPanel from "@/components/layout/SearchPanel";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import ImageUploader from "@/components/cards/ImageUploader";
import { ImagePreview } from "@/components/layout/ImagePreview";
import Dialog from "@/components/ui/Dialog";
import { useTimeline } from "@/hooks/useTimeline";
import { dateFromWeekStart } from "@/lib/utils";
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
  const [isUploading, setIsUploading] = useState(false);
  const [regenId, setRegenId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

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

  useEffect(() => {
    if (regenId !== null || isUploading) show();
    else hide();
  }, [regenId, isUploading, show, hide]);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("termspark-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Show FAB after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setFabVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchResultClick = useCallback((image: ImageRecord) => {
    setSearchOpen(false);
    const date = dateFromWeekStart(image.weekStart, image.dayOfWeek);
    const el = document.getElementById(`day-${date}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        await uploadImage(file);
        toast.success("已收藏 ✿");
      } catch (err: any) {
        toast.error(err?.message || "上传失败");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImage],
  );

  const handleDeleteImage = useCallback((id: number) => {
    setDeleteTarget(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget === null) return;
    try {
      await deleteImage(deleteTarget);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(`删除失败: ${err.message}`);
    }
  }, [deleteTarget, deleteImage]);

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
        {/* <div className="mb-10 text-center relative">
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
        </div> */}

        {/* Upload */}
        <div className="mb-8">
          <ImageUploader
            onFiles={(files) => files.forEach(f => handleUpload(f))}
            uploading={isUploading}
          />
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
                onDeleteImage={handleDeleteImage}
                onDeleteTerm={handleDeleteTerm}
                onRegenerate={handleRegenerate}
                onPreview={setPreviewUrl}
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
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="删除这条灵感？"
        message="删除后无法恢复，确定要继续吗？"
        variant="warning"
        mode="confirm-cancel"
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={handleConfirmDelete}
      />
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
