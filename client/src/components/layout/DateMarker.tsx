import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  date: string;
  dayName: string;
  displayDate: string;
  isToday: boolean;
  imageCount: number;
  collapsed: boolean;
  onToggle: () => void;
}

export default function DateMarker({
  dayName,
  displayDate,
  isToday,
  imageCount,
  collapsed,
  onToggle,
}: Props) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 group select-none w-full md:w-auto"
    >
      <div className="relative flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${
            isToday
              ? "bg-primary today-pulse"
              : "bg-border group-hover:bg-foreground/40"
          } transition-colors`}
        />
      </div>

      <div className="text-left flex items-baseline gap-2">
        <span
          className={`font-hand text-2xl leading-none ${
            isToday ? "text-primary" : "text-foreground"
          }`}
        >
          {displayDate}
        </span>
        <span className="text-xs text-muted-foreground">{dayName}</span>
        {isToday && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-medium">
            今天
          </span>
        )}
        {imageCount > 0 && (
          <span className="text-[11px] text-muted-foreground">
            · {imageCount}
          </span>
        )}
      </div>

      <motion.div
        animate={{ rotate: collapsed ? -90 : 0 }}
        className="ml-auto md:ml-2 text-muted-foreground"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </button>
  );
}
