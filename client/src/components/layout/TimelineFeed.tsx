import { useRef, useEffect, type ReactNode } from 'react';

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
        if (entry.isIntersecting && hasMorePast && !loading) {
          onLoadMorePast();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMorePast, loading, onLoadMorePast]);

  // Bottom sentry — load more future
  useEffect(() => {
    if (!hasMoreFuture || !bottomSentryRef.current) return;
    const el = bottomSentryRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreFuture && !loading) {
          onLoadMoreFuture();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreFuture, loading, onLoadMoreFuture]);

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top sentry — load past */}
      {hasMorePast && (
        <div ref={topSentryRef} className="h-4" />
      )}
      {loading && hasMorePast && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Timeline content */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="timeline-line hidden md:block" />
        {children}
      </div>

      {/* Bottom sentry — load future */}
      {hasMoreFuture && (
        <div ref={bottomSentryRef} className="h-4" />
      )}
      {loading && hasMoreFuture && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      )}

      {/* End state */}
      {!hasMoreFuture && !hasMorePast && !loading && (
        <div className="text-center py-8 text-[var(--text-tertiary)] text-sm font-medium">
          ✨ 已加载全部记录
        </div>
      )}
    </div>
  );
}
