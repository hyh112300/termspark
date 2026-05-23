import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";

interface FloatingActionButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function FloatingActionButton({
  visible,
  onClick,
}: FloatingActionButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          aria-label="回到今天"
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center"
          style={{
            boxShadow:
              "0 10px 30px -8px oklch(from var(--color-primary) l c h / 0.6)",
          }}
        >
          <Camera className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
