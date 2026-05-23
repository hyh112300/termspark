import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export type DialogVariant = "info" | "success" | "warning";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  variant?: DialogVariant;
  /** "confirm" = single confirm button, "confirm-cancel" = two buttons */
  mode?: "confirm" | "confirm-cancel";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** Show washi tape decoration at top */
  tape?: boolean;
}

// const iconMap: Record<DialogVariant, typeof Info> = {
//   info: Info,
//   success: CheckCircle,
//   warning: AlertTriangle,
// };

export default function Dialog({
  open,
  onClose,
  title,
  message,
  // variant = "info",
  mode = "confirm",
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
  tape = true,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // const Icon = iconMap[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="dialog-root">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="dialog-overlay"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="dialog-panel"
          >
            {/* Washi tape decoration */}
            {tape && (
              <>
                <div
                  className="dialog-tape"
                  style={{ top: -10, left: "calc(50% - 50px)", width: 100, transform: "rotate(-2deg)" }}
                />
                <div
                  className="dialog-tape"
                  style={{ top: -10, right: "calc(50% - 62px)", width: 40, transform: "rotate(4deg)" }}
                />
              </>
            )}

            {/* Icon */}
            {/* <div className={`dialog-icon-ring variant-${variant}`}>
              <Icon className="dialog-icon" />
            </div> */}

            {/* Content */}
            <h3 className="font-hand text-2xl text-foreground text-center mt-3">{title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {mode === "confirm-cancel" && (
                <button onClick={handleCancel} className="dialog-btn dialog-btn-cancel">
                  {cancelLabel}
                </button>
              )}
              <button onClick={handleConfirm} className="dialog-btn dialog-btn-confirm">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
