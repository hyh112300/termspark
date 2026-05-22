import type { Decoration } from '@/types';

interface CardDecorationProps {
  decoration: Decoration;
}

export default function CardDecoration({ decoration }: CardDecorationProps) {
  // Washi tape variants
  const washiColors: Record<string, string> = {
    'washi-green': 'tape-washi-green',
    'washi-pink': 'tape-washi-pink',
    'washi-blue': 'tape-washi-blue',
  };

  if (decoration.type in washiColors) {
    const bg = washiColors[decoration.type];

    return (
      <div
        className={`tape tape-washi ${bg}`}
        style={{
          left: `${decoration.x}%`,
          top: `${decoration.y}px`,
          transform: `rotate(${decoration.rotation}deg) translateX(-50%)`,
          width: '48px',
        }}
      />
    );
  }

  // Push pins
  if (decoration.type.startsWith('pin-')) {
    const fill = decoration.type === 'pin-red' ? '#c47a7a' : '#7fa3b0';
    return (
      <div
        className="pin absolute z-2"
        style={{
          left: `${decoration.x}%`,
          top: `${decoration.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <circle cx="7" cy="5" r="4.5" fill={fill} stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          <rect x="6" y="8" width="2" height="8" rx="1" fill={fill} opacity="0.5" />
        </svg>
      </div>
    );
  }

  // Paper clip
  if (decoration.type === 'clip') {
    return (
      <div
        className="absolute z-2 opacity-40"
        style={{
          left: `${decoration.x}%`,
          top: `${decoration.y}px`,
          transform: `rotate(${decoration.rotation}deg) translate(-50%, -50%)`,
        }}
      >
        <svg width="18" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-(--ink-muted)">
          <path d="M6 3v14a4 4 0 0 0 8 0V5a2 2 0 0 0-4 0v12" />
        </svg>
      </div>
    );
  }

  // Tape (cream / grid)
  return (
    <div
      className="tape"
      style={{
        left: `${decoration.x}%`,
        top: `${decoration.y}px`,
        transform: `rotate(${decoration.rotation}deg) translateX(-50%)`,
        width: '36px',
        height: '8px',
        borderRadius: '1px',
        opacity: 0.5,
        background: decoration.type === 'tape-cream'
          ? 'linear-gradient(90deg, transparent, #d4c8b4 30%, #d4c8b4 70%, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(196, 136, 60, 0.12) 25%, rgba(196, 136, 60, 0.12) 75%, transparent)',
      }}
    />
  );
}
