import type { DecorationStyle } from '@/types';

interface CardDecorationProps {
  decoration: DecorationStyle;
}

export default function CardDecoration({ decoration }: CardDecorationProps) {
  return (
    <div
      className="pastel-dot"
      style={{
        left: `${decoration.x}%`,
        top: `${decoration.y}px`,
        width: `${decoration.size}px`,
        height: `${decoration.size}px`,
        background: decoration.color,
      }}
    />
  );
}
