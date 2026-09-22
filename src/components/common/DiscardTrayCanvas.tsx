import React from 'react';

interface DiscardTrayProps {
  totalDecks?: number; // default 6
  discardedDecks: number; // e.g. 2.5 decks discarded
  estimatedDecksRemaining?: number; // optional user estimate to compare
  showActualLine?: boolean;
  className?: string;
  height?: number;
}

export const DiscardTrayCanvas: React.FC<DiscardTrayProps> = ({
  totalDecks = 6,
  discardedDecks,
  estimatedDecksRemaining,
  showActualLine = true,
  className = '',
  height = 320,
}) => {
  // Cap between 0 and totalDecks
  const clampedDiscarded = Math.max(0, Math.min(totalDecks, discardedDecks));
  const fillPercentage = (clampedDiscarded / totalDecks) * 100;

  // If user estimate provided, calculate what that looks like in terms of discarded decks
  // decksDiscarded = totalDecks - decksRemaining
  const estimatedDiscarded =
    estimatedDecksRemaining !== undefined ? Math.max(0, Math.min(totalDecks, totalDecks - estimatedDecksRemaining)) : null;
  const estimatePercentage = estimatedDiscarded !== null ? (estimatedDiscarded / totalDecks) * 100 : null;

  // Discard rack height metrics
  const trayWidth = 140;
  const trayHeight = 240;
  const stackHeight = (trayHeight * fillPercentage) / 100;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative" style={{ width: trayWidth + 70, height: trayHeight + 40 }}>
        {/* SVG Discard Rack */}
        <svg
          width={trayWidth + 70}
          height={trayHeight + 40}
          viewBox={`0 0 ${trayWidth + 70} ${trayHeight + 40}`}
          className="overflow-visible"
        >
          <defs>
            {/* Acrylic Glass Gradient */}
            <linearGradient id="acrylicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.25)" />
              <stop offset="15%" stop-color="rgba(148, 163, 184, 0.08)" />
              <stop offset="85%" stop-color="rgba(148, 163, 184, 0.05)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.2)" />
            </linearGradient>

            {/* Card Edge Pattern for stacked cards */}
            <pattern id="cardEdges" width="20" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#f1f5f9" strokeWidth="1.2" />
              <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#cbd5e1" strokeWidth="0.8" />
              <line x1="0" y1="3" x2="20" y2="3" stroke="#94a3b8" strokeWidth="0.8" />
            </pattern>

            {/* Red Cut Card */}
            <linearGradient id="cutCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="100%" stop-color="#991b1b" />
            </linearGradient>
          </defs>

          {/* Heavy Acrylic Base */}
          <rect
            x="10"
            y={trayHeight + 10}
            width={trayWidth}
            height="16"
            rx="3"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Acrylic Tray Backwall */}
          <rect
            x="15"
            y="10"
            width={trayWidth - 10}
            height={trayHeight}
            rx="2"
            fill="url(#acrylicGrad)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.5"
          />

          {/* Stack of discarded cards */}
          {stackHeight > 0 && (
            <g>
              {/* Stack block */}
              <rect
                x="18"
                y={trayHeight + 10 - stackHeight}
                width={trayWidth - 16}
                height={stackHeight}
                fill="url(#cardEdges)"
                stroke="#64748b"
                strokeWidth="1"
              />
              {/* Top card of the stack (face down or cut card) */}
              <rect
                x="18"
                y={trayHeight + 10 - stackHeight}
                width={trayWidth - 16}
                height="4"
                fill="url(#cutCardGrad)"
              />
            </g>
          )}

          {/* Acrylic Tray Front Wall (Transparent shine) */}
          <rect
            x="12"
            y="10"
            width="6"
            height={trayHeight}
            fill="rgba(255, 255, 255, 0.4)"
          />
          <rect
            x={trayWidth + 2}
            y="10"
            width="6"
            height={trayHeight}
            fill="rgba(255, 255, 255, 0.25)"
          />

          {/* Tray Calibration Ticks (Right Side) */}
          {Array.from({ length: totalDecks * 2 + 1 }).map((_, i) => {
            const deckMark = i * 0.5;
            const yPos = trayHeight + 10 - (trayHeight * (deckMark / totalDecks));
            const isFullDeck = Number.isInteger(deckMark);

            return (
              <g key={`tick-${i}`}>
                <line
                  x1={trayWidth + 10}
                  y1={yPos}
                  x2={trayWidth + (isFullDeck ? 22 : 16)}
                  y2={yPos}
                  stroke={isFullDeck ? '#e2e8f0' : '#64748b'}
                  strokeWidth={isFullDeck ? 1.5 : 1}
                />
                {isFullDeck && (
                  <text
                    x={trayWidth + 26}
                    y={yPos + 4}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    {deckMark}d
                  </text>
                )}
              </g>
            );
          })}

          {/* User Estimate Marker (Golden dashed pointer) */}
          {estimatePercentage !== null && (
            <g>
              <line
                x1="8"
                y1={trayHeight + 10 - (trayHeight * estimatePercentage) / 100}
                x2={trayWidth + 10}
                y2={trayHeight + 10 - (trayHeight * estimatePercentage) / 100}
                stroke="#eab308"
                strokeWidth="2"
                strokeDasharray="4,3"
              />
              {/* Gold arrow */}
              <polygon
                points={`6,${trayHeight + 10 - (trayHeight * estimatePercentage) / 100} 0,${
                  trayHeight + 6 - (trayHeight * estimatePercentage) / 100
                } 0,${trayHeight + 14 - (trayHeight * estimatePercentage) / 100}`}
                fill="#eab308"
              />
            </g>
          )}

          {/* Actual Line (when revealed/active) */}
          {showActualLine && (
            <line
              x1="18"
              y1={trayHeight + 10 - stackHeight}
              x2={trayWidth + 2}
              y2={trayHeight + 10 - stackHeight}
              stroke="#10b981"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Labels below tray */}
        <div className="absolute -bottom-2 left-0 right-0 text-center">
          <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
            6-Deck Discard Rack
          </div>
        </div>
      </div>
    </div>
  );
};
