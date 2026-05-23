import { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setResults([]);
      setTotal(0);
      setSelectedIndex(0);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setSelectedIndex(0);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}&limit=20`);
      const data: SearchResponse = await res.json();
      setResults(data.items);
      setTotal(data.total);
      setSelectedIndex(0);
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
    debounceRef.current = setTimeout(() => doSearch(v), 250);
  }, [doSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIndex];
      if (item) onResultClick(item);
    }
  }, [results, selectedIndex, onClose, onResultClick]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div className="spotlight-root">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="spotlight-overlay"
            onClick={onClose}
          />

          {/* Spotlight panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="spotlight-panel"
          >
            {/* Input */}
            <div className="spotlight-input-row">
              <Search className="spotlight-search-icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="搜索术语..."
                className="spotlight-input"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); setTotal(0); inputRef.current?.focus(); }}
                  className="spotlight-clear-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="7" cy="7" r="6" />
                    <path d="M4.5 7h5" />
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            {searching && (
              <div className="spotlight-loading">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}

            {!searching && query && results.length > 0 && (
              <div ref={listRef} className="spotlight-results">
                {results.map((img, i) => (
                  <button
                    key={img.id}
                    data-index={i}
                    onClick={() => onResultClick(img)}
                    className={`spotlight-result ${i === selectedIndex ? 'is-selected' : ''}`}
                  >
                    <div className="spotlight-result-thumb">
                      <img src={`/uploads/${img.filename}`} alt={img.originalName} loading="lazy"
                        className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.originalName}</p>
                      <div className="flex gap-1 mt-0.5">
                        {img.terms.slice(0, 3).map(t => (
                          <span key={t.id} className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                            {t.term}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="spotlight-result-enter">⏎</span>
                  </button>
                ))}
              </div>
            )}

            {!searching && query && results.length === 0 && (
              <div className="spotlight-empty">没有找到匹配结果</div>
            )}

            {!searching && !query && (
              <div className="spotlight-hint">
                输入关键词搜索设计术语
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
