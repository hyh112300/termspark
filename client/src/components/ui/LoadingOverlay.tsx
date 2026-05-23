import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingContextValue {
  show: () => void;
  hide: () => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useGlobalLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within GlobalLoadingProvider");
  return ctx;
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const countRef = useRef(0);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    countRef.current += 1;
    if (countRef.current === 1) setVisible(true);
  }, []);

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) setVisible(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      {children}
      <AnimatePresence>
        {visible && <LoadingOverlay />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Coffee cup */}
        <div className="relative w-[100px] h-[80px] flex items-center justify-center">
          {/* Cup body */}
          <div
            className="absolute h-[18px] bg-card border border-[var(--ink)]/30 rounded-[2px_2px_10px_10px] z-[1]"
            style={{ animation: "cup-expand 6s infinite ease-in-out", transformOrigin: "center" }}
          >
            {/* Cup rim highlight */}
            <div className="absolute -top-[2px] w-[calc(100%-2px)] h-[2px] bg-[var(--washi-yellow)]/60 border border-[var(--ink)]/20 rounded-[50%]" />
            {/* Cup bottom shadow */}
            <div className="absolute top-[15px] w-[calc(100%-2px)] h-[4px] bg-transparent border border-[var(--ink)]/30 border-t-0 rounded-[50%] -z-[1]" />
            {/* Handle */}
            <div className="absolute w-[5px] h-[10px] bg-card border border-[var(--ink)]/30 -right-[5px] top-[2px] rounded-[2px_10px_20px_2px]" />
            {/* Smoke wisps */}
            <div className="absolute bottom-full left-1/2 w-[15px] h-[25px] bg-[var(--ink)]/15 rounded-[50%] -translate-x-1/2 animate-[smoke-rise_6s_infinite_ease-in-out] blur-[8px]" />
            <div className="absolute bottom-full left-1/2 w-[15px] h-[25px] bg-[var(--ink)]/15 rounded-[50%] -translate-x-1/2 animate-[smoke-rise_6s_infinite_ease-in-out] blur-[8px]" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-full left-1/2 w-[15px] h-[25px] bg-[var(--ink)]/15 rounded-[50%] -translate-x-1/2 animate-[smoke-rise_6s_infinite_ease-in-out] blur-[8px]" style={{ animationDelay: "2s" }} />
          </div>
          {/* Dots below cup */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 text-[10px] opacity-40 -z-[1] tracking-[4px] text-[var(--ink)]">
            ··················
          </div>
        </div>

        {/* Text */}
        {/* <p className="font-hand text-2xl text-foreground animate-pulse">
          AI 正在解析…
        </p> */}
      </div>
    </motion.div>
  );
}
