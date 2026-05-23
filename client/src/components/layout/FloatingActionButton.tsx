import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

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
          onClick={onClick}
          aria-label="回到顶部"
          className="fab-button"
        >
          <ArrowUp className="fab-icon" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
