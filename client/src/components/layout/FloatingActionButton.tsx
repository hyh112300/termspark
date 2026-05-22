import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';

interface FloatingActionButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function FloatingActionButton({ visible, onClick }: FloatingActionButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full glass-l2 shadow-lg flex items-center justify-center text-[var(--accent)] hover:text-white hover:bg-[var(--accent)] transition-colors"
          aria-label="上传图片"
        >
          <Camera className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
