import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TermRecord } from '@/types';
import TermTag from './TermTag';

interface TermListProps {
  terms: TermRecord[];
  onDeleteTerm: (termId: number) => void;
}

export default function TermList({ terms, onDeleteTerm }: TermListProps) {
  const [expanded, setExpanded] = useState(false);

  if (!terms || terms.length === 0) return null;

  const displayTerms = expanded ? terms : terms.slice(0, 1);
  const remaining = terms.length - 1;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      <AnimatePresence>
        {displayTerms.map((term) => (
          <TermTag key={term.id} term={term} onDelete={onDeleteTerm} />
        ))}
      </AnimatePresence>

      {!expanded && remaining > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs
            bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--border-color)]
            transition-colors text-hand"
        >
          +{remaining}
        </button>
      )}

      {expanded && terms.length > 1 && (
        <button
          onClick={() => setExpanded(false)}
          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs
            bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--border-color)]
            transition-colors text-hand"
        >
          收起
        </button>
      )}
    </div>
  );
}
