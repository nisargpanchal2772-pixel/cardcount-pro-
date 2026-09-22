import React from 'react';
import type { Card, Suit } from '../../lib/blackjack/types';

interface CardViewProps {
  card?: Card;
  faceDown?: boolean;
  showHiLoBadge?: boolean;
  isHighlighted?: boolean;
  highlightColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const SUIT_ICONS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  showHiLoBadge = false,
  isHighlighted = false,
  highlightColor = 'ring-4 ring-amber-400 shadow-amber-400/50',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-14 h-20 text-xs rounded-lg',
    md: 'w-20 h-28 text-sm rounded-xl',
    lg: 'w-24 sm:w-28 h-36 sm:h-40 text-base rounded-2xl',
    xl: 'w-32 sm:w-36 h-48 sm:h-52 text-lg rounded-2xl',
  }[size];

  if (faceDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} select-none flex-shrink-0 cursor-default bg-gradient-to-br from-red-900 via-red-950 to-neutral-950 border-2 border-red-800/80 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isHighlighted ? `scale-105 ${highlightColor}` : ''
        } ${className}`}
        style={{
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.7), inset 0 0 12px rgba(239, 68, 68, 0.3)',
        }}
      >
        {/* Luxury geometric casino lattice pattern */}
        <div className="absolute inset-1.5 rounded-lg border border-amber-400/30 opacity-60 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:6px_6px]" />
        
        {/* Outer gold embossed seal */}
        <div className="relative z-10 w-9 h-9 rounded-full border-2 border-amber-400/60 flex items-center justify-center bg-black/60 shadow-inner">
          <span className="text-amber-400 font-bold text-sm drop-shadow">♠</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitIcon = SUIT_ICONS[card.suit];

  const hiloBadgeBg =
    card.hiloValue === 1
      ? 'bg-emerald-500 text-white shadow-emerald-500/50'
      : card.hiloValue === -1
      ? 'bg-rose-500 text-white shadow-rose-500/50'
      : 'bg-slate-600 text-white shadow-slate-600/50';

  const hiloText = card.hiloValue > 0 ? `+${card.hiloValue}` : `${card.hiloValue}`;

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} select-none flex-shrink-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 border border-slate-200/90 shadow-2xl flex flex-col justify-between p-1.5 sm:p-2 transition-all duration-200 active:scale-95 ${
        isHighlighted ? `scale-105 z-20 ${highlightColor}` : 'hover:-translate-y-1'
      } ${className}`}
      style={{
        boxShadow:
          '0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Top Left Rank & Suit */}
      <div className={`flex flex-col items-center leading-none font-bold ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        <span className="tracking-tighter font-extrabold font-mono text-sm sm:text-base">{card.rank}</span>
        <span className="text-xs sm:text-sm -mt-0.5">{suitIcon}</span>
      </div>

      {/* Center Graphic */}
      <div className={`flex items-center justify-center flex-1 ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        {['J', 'Q', 'K'].includes(card.rank) ? (
          <div className="w-full text-center border-y border-dashed border-slate-300/80 py-1 font-mono font-extrabold text-[11px] sm:text-xs tracking-widest uppercase opacity-90">
            {card.rank === 'J' ? 'JACK' : card.rank === 'Q' ? 'QUEEN' : 'KING'}
          </div>
        ) : card.rank === 'A' ? (
          <span className="text-2xl sm:text-4xl opacity-90 drop-shadow-sm">{suitIcon}</span>
        ) : (
          <span className="text-xl sm:text-3xl opacity-80">{suitIcon}</span>
        )}
      </div>

      {/* Bottom Right Inverted Rank & Suit */}
      <div className={`flex flex-col items-center leading-none font-bold rotate-180 ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        <span className="tracking-tighter font-extrabold font-mono text-sm sm:text-base">{card.rank}</span>
        <span className="text-xs sm:text-sm -mt-0.5">{suitIcon}</span>
      </div>

      {/* Hi-Lo Floating Pill Badge */}
      {showHiLoBadge && (
        <div
          className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-lg ring-2 ring-slate-950 ${hiloBadgeBg}`}
        >
          {hiloText}
        </div>
      )}
    </div>
  );
};
