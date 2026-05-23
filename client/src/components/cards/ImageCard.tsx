import { useState } from "react";
import { Trash2, Check, RotateCw, Eye } from "lucide-react";
import type { ImageRecord } from "@/types";

interface FlipCardProps {
  image: ImageRecord;
  onDelete: (id: number) => void;
  onDeleteTerm: (termId: number) => void;
  onRegenerate: (imageId: number) => void;
  onPreview: (url: string) => void;
  regenerating?: boolean;
}

export default function FlipCard({
  image, onDelete, onDeleteTerm, onRegenerate, onPreview, regenerating,
}: FlipCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(null), 1100); } catch {}
  };

  const imgSrc = `/uploads/${image.filename}`;

  return (
    <div className="flip-perspective relative aspect-[3/4] group" onClick={() => setFlipped((f) => !f)}>
      <div className={`flip-inner relative w-full h-full ${flipped ? "is-flipped" : ""}`}>
        {/* Front */}
        <div className="flip-face paper-card !p-0">
          <img src={imgSrc} alt={image.originalName} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px] backdrop-blur-md">{image.terms.length} 词</div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="px-2 py-1 rounded-md bg-white/85 text-ink text-[10px] font-medium truncate max-w-[70%] backdrop-blur-sm">{image.originalName}</div>
          </div>
        </div>
        {/* Back */}
        <div className="flip-face flip-back conic-glow">
          <div className="absolute inset-[2px] rounded-[12px] bg-card p-4 flex flex-col overflow-hidden">
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-washi-pink blur-2xl opacity-50" />
            <div className="absolute -bottom-10 -right-6 w-32 h-32 rounded-full bg-washi-blue blur-2xl opacity-50" />
            <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-washi-yellow blur-2xl opacity-40" />
            <div className="relative flex items-center justify-between mb-3">
              <div>
                <p className="font-hand text-2xl leading-none text-foreground">术语 · {image.terms.length}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">AI extracted</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onRegenerate(image.id); }} disabled={regenerating}
                  className="w-8 h-8 rounded-full bg-background/60 hover:bg-secondary text-muted-foreground flex items-center justify-center transition-colors disabled:opacity-50"
                  title="重新生成">
                  <RotateCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onPreview(imgSrc); }}
                  className="w-8 h-8 rounded-full bg-background/60 hover:bg-secondary text-muted-foreground flex items-center justify-center transition-colors"
                  title="预览大图">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("删除这条灵感？")) onDelete(image.id); }}
                  className="w-8 h-8 rounded-full bg-background/60 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 overflow-y-auto flex flex-wrap gap-1.5 content-start pr-1">
              {image.terms.length === 0 && <p className="text-xs text-muted-foreground font-hand text-lg">还没解析出术语～</p>}
              {image.terms.map((t, i) => (
                <button key={`${t.id}-${i}`} onClick={(e) => { e.stopPropagation(); copy(t.term); }}
                  className="term-sticker animate-wiggle-in group/term relative" style={{ animationDelay: `${i * 40}ms` }}>
                  {copied === t.term ? (<><Check className="w-3 h-3 mr-1 text-primary" /> 已复制</>) : t.term}
                  <button onClick={(e) => { e.stopPropagation(); onDeleteTerm(t.id); }}
                    className="ml-1 opacity-0 group-hover/term:opacity-50 hover:!opacity-100 transition-opacity shrink-0">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6" /></svg>
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
