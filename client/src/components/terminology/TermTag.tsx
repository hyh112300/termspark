import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { TermRecord } from '@/types';
import { copyToClipboard } from '@/lib/utils';

interface TermTagProps {
  term: TermRecord;
  onDelete: (id: number) => void;
}

export default function TermTag({ term, onDelete }: TermTagProps) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  const handleClick = async () => {
    const ok = await copyToClipboard(term.term);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer
        bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20
        hover:bg-[var(--accent)]/20 transition-colors select-none"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="text-hand font-medium">{term.term}</span>
      {copied && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] rounded bg-[#3d2b1f] text-[#fef3c7] whitespace-nowrap"
        >
          已复制
        </motion.span>
      )}
      {hover && (
        <button
          className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(term.id); }}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </motion.span>
  );
}
