import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../../lib/blackjack/types';
import { createShoe } from '../../lib/blackjack/deck';
import { findCancellationPairs } from '../../lib/blackjack/hilo';
import { CardView } from '../common/CardView';
import { sounds } from '../../lib/audio';
import { useAppStore } from '../../lib/store';
import { Users, Timer, Check, X, Eye, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerSpot {
  id: number;
  name: string;
  cards: [Card, Card];
}

export const CancellationDrill: React.FC = () => {
  const { stats, recordCancellationResult } = useAppStore();

  const [spots, setSpots] = useState<PlayerSpot[]>([]);
  const [timeLimit, setTimeLimit] = useState<number>(10); // 5s, 10s, 15s, 0 = untimed
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [userEstimate, setUserEstimate] = useState<string>('');
  const [showPairAssistant, setShowPairAssistant] = useState<boolean>(false);
  const [roundAudited, setRoundAudited] = useState<boolean>(false);

  // Flattened cards for pair cancellation engine
  const allCards = useMemo(() => {
    return spots.flatMap((s) => s.cards);
  }, [spots]);

  const cancellationData = useMemo(() => {
    return findCancellationPairs(allCards);
  }, [allCards]);

  const dealNewRound = useCallback(() => {
    const shoe = createShoe(1);
    const newSpots: PlayerSpot[] = [];

    for (let i = 0; i < 5; i++) {
      newSpots.push({
        id: i + 1,
        name: `Seat ${i + 1}`,
        cards: [shoe[i * 2], shoe[i * 2 + 1]],
      });
    }

    setSpots(newSpots);
    setTimeLeft(timeLimit);
    setUserEstimate('');
    setRoundAudited(false);
    setIsRoundActive(true);
    sounds.playShuffle();
  }, [timeLimit]);

  // Deal initial round on mount
  useEffect(() => {
    dealNewRound();
  }, [dealNewRound]);

  // Countdown timer loop
  useEffect(() => {
    if (!isRoundActive || timeLimit === 0 || roundAudited) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, timeLimit, roundAudited]);

  const handleRoundTimeExpire = () => {
    // If time expires before submitting, auto-audit
    if (!roundAudited) {
      handleAuditSubmission(true);
    }
  };

  const handleAuditSubmission = (timedOut: boolean = false) => {
    const parsed = parseInt(userEstimate.trim(), 10);
    const isCorrect = !timedOut && !isNaN(parsed) && parsed === cancellationData.netCount;

    setIsRoundActive(false);
    setRoundAudited(true);
    recordCancellationResult(isCorrect);

    if (isCorrect) {
      sounds.playCorrect();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b'],
      });
    } else {
      sounds.playError();
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (roundAudited) {
          dealNewRound();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roundAudited, dealNewRound]);

  // Highlight color helper for cancellation
  const getCardHighlight = (cardIndex: number) => {
    if (!showPairAssistant && !roundAudited) return undefined;

    const pairIndex = cancellationData.pairs.findIndex(
      (p) => p.cardIndex1 === cardIndex || p.cardIndex2 === cardIndex
    );
    if (pairIndex !== -1) {
      return {
        isCancelled: true,
        label: `Pair ${pairIndex + 1}`,
      };
    }

    return {
      isCancelled: false,
    };
  };

  const netCountSign = cancellationData.netCount > 0 ? `+${cancellationData.netCount}` : `${cancellationData.netCount}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 flex flex-col items-center select-none">
      {/* Top Ribbons & Stats */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-center">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{stats.cancellation.roundsCompleted} Rounds</div>
          <div className="text-[10px] text-slate-500">{stats.cancellation.correctRounds} correct</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak</span>
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.cancellation.currentStreak}</div>
          <div className="text-[10px] text-slate-500">Best: {stats.cancellation.bestStreak}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span>Timer</span>
          </div>
          <div
            className={`text-xl font-bold mt-1 ${
              timeLeft <= 3 && isRoundActive ? 'text-rose-500 animate-pulse' : 'text-blue-400'
            }`}
          >
            {timeLimit === 0 ? 'Untimed' : `${timeLeft}s`}
          </div>
          <div className="text-[10px] text-slate-500">
            {timeLimit === 0 ? 'Free pace' : `${timeLimit}s round`}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-sans mb-1">Time Limit</div>
          <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {[5, 10, 15, 0].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeLimit(t);
                  setTimeLeft(t);
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeLimit === t ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 0 ? 'Off' : `${t}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blackjack Felt Table (5 player spots) */}
      <div className="w-full relative casino-felt-table rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[440px] border border-emerald-900/50 shadow-2xl">
        {/* Table Arc & Dealer Chip Rack decoration */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-emerald-800/40">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>5-PLAYER TABLE SIMULATOR</span>
          </div>

          {/* Cancellation Visual Helper Switch */}
          <button
            onClick={() => setShowPairAssistant((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all border ${
              showPairAssistant
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Cancellation Helper: {showPairAssistant ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 5 Player Spots Layout */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 my-6">
          {spots.map((spot, spotIdx) => {
            const c1Index = spotIdx * 2;
            const c2Index = spotIdx * 2 + 1;
            const h1 = getCardHighlight(c1Index);
            const h2 = getCardHighlight(c2Index);
            const spotNet = spot.cards[0].hiloValue + spot.cards[1].hiloValue;

            return (
              <div
                key={spot.id}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                  roundAudited
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-emerald-950/40 border-emerald-800/50 hover:border-emerald-700'
                }`}
              >
                <div className="text-[11px] font-mono text-emerald-300/90 font-bold uppercase tracking-wider mb-2">
                  {spot.name}
                </div>

                {/* Spot's 2 cards overlapping */}
                <div className="relative flex justify-center h-28 w-28 select-none">
                  <div className="absolute left-0 top-0">
                    <CardView
                      card={spot.cards[0]}
                      size="sm"
                      isHighlighted={h1?.isCancelled}
                      highlightColor="border-amber-400 ring-2 ring-amber-400"
                    />
                  </div>
                  <div className="absolute left-10 top-0">
                    <CardView
                      card={spot.cards[1]}
                      size="sm"
                      isHighlighted={h2?.isCancelled}
                      highlightColor="border-amber-400 ring-2 ring-amber-400"
                    />
                  </div>
                </div>

                {/* Spot Count breakdown on audit */}
                {roundAudited && (
                  <div className="mt-2 font-mono text-xs flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-400">Spot Net:</span>
                    <span className={`font-bold ${spotNet > 0 ? 'text-emerald-400' : spotNet < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {spotNet > 0 ? `+${spotNet}` : spotNet}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input & Action Section */}
        <div className="w-full max-w-xl bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-xl">
          {!roundAudited ? (
            <div className="w-full flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                Cancel pairs in your head. Enter Total Table Count Change:
              </span>

              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  autoFocus
                  placeholder="Net Count (e.g. +1, 0, -2)"
                  value={userEstimate}
                  onChange={(e) => setUserEstimate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAuditSubmission();
                  }}
                  className="flex-1 text-center text-xl font-mono font-bold py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-400 focus:outline-none text-amber-300 placeholder:text-slate-600"
                />
                <button
                  onClick={() => handleAuditSubmission()}
                  disabled={userEstimate.trim() === ''}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick keypad */}
              <div className="grid grid-cols-7 gap-1 w-full font-mono text-xs">
                {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setUserEstimate(String(val))}
                    className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-200 font-bold"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-full ${
                    parseInt(userEstimate, 10) === cancellationData.netCount
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {parseInt(userEstimate, 10) === cancellationData.netCount ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <h4 className="text-base font-bold text-white">
                  {parseInt(userEstimate, 10) === cancellationData.netCount
                    ? 'Perfect Pair Cancellation!'
                    : 'Count Discrepancy!'}
                </h4>
              </div>

              {/* Detailed Breakdown */}
              <div className="w-full bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono grid grid-cols-3 gap-2">
                <div>
                  <div className="text-slate-500">Cancelled Pairs</div>
                  <div className="text-amber-400 font-bold text-sm">
                    {cancellationData.pairs.length} pairs (net 0)
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Unpaired Cards</div>
                  <div className="text-slate-300 font-bold text-sm">
                    {cancellationData.unpairedPositives.length} high / {cancellationData.unpairedNegatives.length} low
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Actual Table Net</div>
                  <div className="text-emerald-400 font-bold text-base">{netCountSign}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full mt-1">
                <button
                  onClick={dealNewRound}
                  autoFocus
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Deal Next Table [Space]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={dealNewRound}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pair Cancellation Pro Tip */}
      <div className="w-full mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 leading-relaxed font-sans">
        <strong className="text-amber-400 font-mono uppercase block mb-1">
          Pro Blackjack Cancellation Strategy:
        </strong>
        Never count card-by-card in a real casino. Scan hands in pairs: a low card (2-6) paired with a high card
        (10-A) cancels out immediately to zero. When you glance across the table, your eyes should only tally the
        uncancelled leftover cards!
      </div>
    </div>
  );
};
