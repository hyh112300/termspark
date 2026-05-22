import { useState } from 'react';
import { motion } from 'framer-motion';
import { copyToClipboard } from '@/lib/utils';

interface TermTagProps {
  term: string;
  onDelete?: () => void;
}

export default function TermTag({ term, onDelete }: TermTagProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await copyToClipboard(term);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 3, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className="term-tag text-left max-w-full"
      onClick={handleClick}
      title="点击复制"
    >
      <span className="truncate">{term}</span>
      {copied && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[10px] font-sans shrink-0"
        >✓</motion.span>
      )}
      {onDelete && (
        <span
          className="ml-0.5 p-0.5 rounded-full hover:bg-[var(--bg-hover)] opacity-50 hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}
