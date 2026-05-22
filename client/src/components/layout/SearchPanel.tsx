import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImageRecord, SearchResponse } from '@/types';

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  onResultClick: (image: ImageRecord) => void;
}

export default function SearchPanel({ open, onClose, onResultClick }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setTotal(0);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}&limit=20`);
      const data: SearchResponse = await res.json();
      setResults(data.items);
      setTotal(data.total);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  }, [doSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="search-overlay"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="search-panel"
          >
            <div className="max-w-2xl mx-auto">
              {/* Search input */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-tertiary)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="搜索术语..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[15px] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              {searching && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                </div>
              )}

              {!searching && query && (
                <div className="text-sm text-[var(--text-secondary)] mb-3">
                  找到 {total} 个匹配结果
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
                  {results.map(img => (
                    <button
                      key={img.id}
                      onClick={() => onResultClick(img)}
                      className="group text-left"
                    >
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-[var(--bg-base)] mb-1.5">
                        <img
                          src={`/uploads/${img.filename}`}
                          alt={img.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {img.terms.slice(0, 2).map(t => (
                          <span key={t.id} className="text-[11px] text-[var(--tag-text)] bg-[var(--tag-bg)] px-1.5 py-0.5 rounded-full truncate max-w-full">
                            {t.term}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
                  没有找到匹配结果
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
