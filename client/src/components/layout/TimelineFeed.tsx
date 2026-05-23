import { useRef, useEffect, type ReactNode } from "react";

interface TimelineFeedProps {
  children: ReactNode;
  loading: boolean;
  loadingMore: boolean;
  hasMorePast: boolean;
  hasMoreFuture: boolean;
  onLoadMorePast: () => void;
  onLoadMoreFuture: () => void;
}

export default function TimelineFeed({
  children,
  loading,
  loadingMore,
  hasMorePast,
  hasMoreFuture,
  onLoadMorePast,
  onLoadMoreFuture,
}: TimelineFeedProps) {
  const topSentryRef = useRef<HTMLDivElement>(null);
  const bottomSentryRef = useRef<HTMLDivElement>(null);

  // Top sentry — load more past
  useEffect(() => {
    if (!hasMorePast || !topSentryRef.current) return;
    const el = topSentryRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMorePast && !loading && !loadingMore) {
          onLoadMorePast();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMorePast, loading, loadingMore, onLoadMorePast]);

  // Bottom sentry — load more future
  useEffect(() => {
    if (!hasMoreFuture || !bottomSentryRef.current) return;
    const el = bottomSentryRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreFuture &&
          !loading &&
          !loadingMore
        ) {
          onLoadMoreFuture();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreFuture, loading, loadingMore, onLoadMoreFuture]);

  return (
    <div className="relative">
      {/* Top sentry — load past */}
      {hasMorePast && <div ref={topSentryRef} className="h-4" />}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Timeline content */}
      <div className="relative">
        {/* Vertical timeline line (desktop) */}
        <div className="hidden md:block timeline-line" />
        {children}
      </div>

      {/* Bottom sentry — load future */}
      {hasMoreFuture && <div ref={bottomSentryRef} className="h-4" />}

      {/* End state */}
      {!loading &&
        !hasMorePast &&
        !hasMoreFuture &&
        !loadingMore && (
          <div className="text-center py-8 text-muted-foreground text-sm font-medium">
            ✨ 已加载全部记录
          </div>
        )}
    </div>
  );
}
