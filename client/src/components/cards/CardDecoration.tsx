import type { Decoration } from '@/types';

interface CardDecorationProps {
  decoration: Decoration;
}

const decorationStyles: Record<Decoration['type'], { bg: string; icon?: string; width: string }> = {
  'washi-green': { bg: 'bg-emerald-300/60', width: 'w-16' },
  'washi-pink': { bg: 'bg-pink-300/60', width: 'w-14' },
  'washi-blue': { bg: 'bg-sky-300/60', width: 'w-16' },
  'pin-red': { bg: '', width: '' },
  'pin-blue': { bg: '', width: '' },
  'clip': { bg: '', width: '' },
  'tape-cream': { bg: 'bg-[#f5e6d3]/70', width: 'w-12' },
  'tape-grid': { bg: 'bg-[#f5e6d3]/60 tape-stripe', width: 'w-14' },
};

export default function CardDecoration({ decoration }: CardDecorationProps) {
  const style = decorationStyles[decoration.type];

  // Push pins
  if (decoration.type === 'pin-red' || decoration.type === 'pin-blue') {
    const color = decoration.type === 'pin-red' ? 'text-red-500' : 'text-blue-500';
    return (
      <div
        className={`absolute ${color} drop-shadow-md`}
        style={{
          left: `${decoration.x}%`,
          top: `${decoration.y}%`,
          transform: `rotate(${decoration.rotation}deg) translate(-50%, -50%)`,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="3" />
          <rect x="7" y="5" width="2" height="8" rx="1" />
        </svg>
      </div>
    );
  }

  // Paper clip
  if (decoration.type === 'clip') {
    return (
      <div
        className="absolute text-gray-400 drop-shadow-sm"
        style={{
          left: `${decoration.x}%`,
          top: `${decoration.y}%`,
          transform: `rotate(${decoration.rotation}deg) translate(-50%, -50%)`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 2v16a4 4 0 0 0 8 0V5a2 2 0 0 0-4 0v12" />
        </svg>
      </div>
    );
  }

  // Washi tape / cream tape / grid tape
  return (
    <div
      className={`absolute ${style.bg} ${style.width} h-6 rounded-sm -mt-1`}
      style={{
        left: `${decoration.x}%`,
        top: `${decoration.y}%`,
        transform: `rotate(${decoration.rotation}deg) translate(-50%, -50%)`,
      }}
    />
  );
}
