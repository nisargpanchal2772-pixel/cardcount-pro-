import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../lib/blackjack/types';
import { createShoe } from '../../lib/blackjack/deck';
import { CardView } from '../common/CardView';
import { sounds } from '../../lib/audio';
import { useAppStore } from '../../lib/store';
import { Play, Pause, RotateCcw, Zap, Target, Gauge, Check, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpeedDrill: React.FC = () => {
  const { stats, recordSpeedResult, countVisibility } = useAppStore();

  // Drill Shoe & Dealing
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(1));
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(-1);
  const [runningCount, setRunningCount] = useState<number>(0);

  // Speed Settings
  const [speedSec, setSpeedSec] = useState<number>(1.0); // 0.5, 1.0, 1.5, 2.0, 0 = manual
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [checkpointInterval, setCheckpointInterval] = useState<number>(20);
  const [showValueHint, setShowValueHint] = useState<boolean>(true);

  // Checkpoint / Audit State
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [userEnteredCount, setUserEnteredCount] = useState<string>('');
  const [auditResult, setAuditResult] = useState<{
    correct: boolean;
    actualCount: number;
    userCount: number;
    diff: number;
  } | null>(null);

  // Reaction Time Metrics
  const lastFlipTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const activeCard: Card | undefined = currentCardIndex >= 0 ? shoe[currentCardIndex] : undefined;

  // Initialize fresh shoe
  const resetDrill = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    const newShoe = createShoe(1);
    setShoe(newShoe);
    setCurrentCardIndex(-1);
    setRunningCount(0);
    setIsPromptOpen(false);
    setAuditResult(null);
    setUserEnteredCount('');
    sounds.playShuffle();
  }, []);

  // Advance to next card
  const flipNextCard = useCallback(() => {
    if (isPromptOpen) return;

    setCurrentCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // Check if end of shoe
      if (nextIndex >= shoe.length) {
        setIsPlaying(false);
        setIsPromptOpen(true);
        return prevIndex;
      }

      const nextCard = shoe[nextIndex];
      const newRc = (prevIndex === -1 ? 0 : runningCount) + nextCard.hiloValue;
      setRunningCount(newRc);

      // Reaction time
      const now = Date.now();
      lastFlipTimeRef.current = now;

      sounds.playCardFlip();

      // Checkpoint trigger
      if ((nextIndex + 1) % checkpointInterval === 0) {
        setIsPlaying(false);
        setIsPromptOpen(true);
      }

      return nextIndex;
    });
  }, [shoe, runningCount, checkpointInterval, isPromptOpen]);

  // Auto-play timer loop
  useEffect(() => {
    if (isPlaying && speedSec > 0 && !isPromptOpen) {
      timerRef.current = window.setInterval(() => {
        flipNextCard();
      }, speedSec * 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedSec, isPromptOpen, flipNextCard]);

  // Keyboard Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in audit input
      if (isPromptOpen) {
        if (e.key === 'Enter') {
          handleVerifyCount();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (speedSec === 0 || !isPlaying) {
          flipNextCard();
        } else {
          setIsPlaying((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPromptOpen, speedSec, isPlaying, flipNextCard]);

  // Verify entered count at checkpoint
  const handleVerifyCount = () => {
    const parsed = parseInt(userEnteredCount.trim(), 10);
    if (isNaN(parsed)) return;

    const isCorrect = parsed === runningCount;
    const diff = parsed - runningCount;

    setAuditResult({
      correct: isCorrect,
      actualCount: runningCount,
      userCount: parsed,
      diff,
    });

    recordSpeedResult(isCorrect);

    if (isCorrect) {
      sounds.playCorrect();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });
    } else {
      sounds.playError();
    }
  };

  const resumeAfterAudit = () => {
    setIsPromptOpen(false);
    setAuditResult(null);
    setUserEnteredCount('');
    if (currentCardIndex + 1 >= shoe.length) {
      resetDrill();
    }
  };

  // Speed Calculations
  const cardsPerMin = speedSec > 0 ? Math.round(60 / speedSec) : 'Manual';
  const progressPercent = Math.min(100, Math.round(((currentCardIndex + 1) / shoe.length) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center select-none">
      {/* Top Stat Ribbon */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accuracy</span>
          </div>
          <span className="text-xl font-bold text-white mt-1">
            {stats.speed.totalChecks > 0
              ? `${Math.round((stats.speed.correctChecks / stats.speed.totalChecks) * 100)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-slate-500">
            {stats.speed.correctChecks}/{stats.speed.totalChecks} checks
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak</span>
          </div>
          <span className="text-xl font-bold text-amber-400 mt-1">
            {stats.speed.currentStreak}
          </span>
          <span className="text-[10px] text-slate-500">Best: {stats.speed.bestStreak}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Pace</span>
          </div>
          <span className="text-xl font-bold text-blue-400 mt-1">
            {typeof cardsPerMin === 'number' ? `${cardsPerMin}` : cardsPerMin}
          </span>
          <span className="text-[10px] text-slate-500">cards / min</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Shoe Progress</span>
          </div>
          <span className="text-xl font-bold text-slate-200 mt-1">
            {Math.max(0, currentCardIndex + 1)} / {shoe.length}
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Felt Card Station */}
      <div className="w-full relative casino-felt-table rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[360px] border border-emerald-900/50 shadow-2xl">
        {/* Count Assist / Stealth Indicator */}
        {countVisibility === 'visible' && currentCardIndex >= 0 && (
          <div className="absolute top-4 left-6 flex items-center gap-2 bg-slate-950/70 border border-emerald-900/80 px-3 py-1.5 rounded-full font-mono text-xs">
            <span className="text-slate-400">Live RC:</span>
            <span className={`font-bold ${runningCount > 0 ? 'text-emerald-400' : runningCount < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {runningCount > 0 ? `+${runningCount}` : runningCount}
            </span>
          </div>
        )}

        {/* Value Hint Switch */}
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setShowValueHint((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors border ${
              showValueHint
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            Hi-Lo Hint: {showValueHint ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Card Display */}
        <div className="my-4">
          {activeCard ? (
            <CardView
              card={activeCard}
              size="xl"
              showHiLoBadge={showValueHint}
              className="animate-in zoom-in-95 duration-150"
            />
          ) : (
            <div
              onClick={flipNextCard}
              className="cursor-pointer group flex flex-col items-center justify-center w-36 h-52 rounded-2xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/30 text-emerald-300 hover:border-amber-400/80 hover:text-amber-300 transition-all shadow-inner p-4 text-center"
            >
              <Zap className="w-10 h-10 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Start Drill</span>
              <span className="text-[11px] opacity-70 mt-1 font-mono">Press Space or Tap</span>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 z-10">
          {speedSec > 0 ? (
            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Auto Flip'}</span>
            </button>
          ) : (
            <button
              onClick={flipNextCard}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition-all"
            >
              <span>Next Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={resetDrill}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reshuffle</span>
          </button>
        </div>
      </div>

      {/* Speed & Checkpoint Controls */}
      <div className="w-full mt-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Deal Speed Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Speed:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            {[
              { label: '0.5s', val: 0.5 },
              { label: '1.0s', val: 1.0 },
              { label: '1.5s', val: 1.5 },
              { label: '2.0s', val: 2.0 },
              { label: 'Tap/Space', val: 0 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSpeedSec(preset.val);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  speedSec === preset.val
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkpoint Interval */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Check count every:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            {[10, 20, 30, 52].map((num) => (
              <button
                key={num}
                onClick={() => setCheckpointInterval(num)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  checkpointInterval === num
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num === 52 ? 'Shoe End' : `${num} Cards`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Running Count Verification Modal */}
      {isPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
            {!auditResult ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Count Checkpoint!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    You have seen {currentCardIndex + 1} cards. What is the current Running Count?
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <input
                    type="number"
                    autoFocus
                    placeholder="Enter Count (e.g. +3 or -2)"
                    value={userEnteredCount}
                    onChange={(e) => setUserEnteredCount(e.target.value)}
                    className="w-full text-center text-2xl font-mono font-bold py-3 bg-slate-950 border-2 border-slate-700 rounded-xl focus:border-amber-400 focus:outline-none text-amber-400 placeholder:text-slate-600"
                  />

                  {/* Quick button keypad */}
                  <div className="grid grid-cols-5 gap-1.5 w-full">
                    {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setUserEnteredCount(String(val))}
                        className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200 transition-colors"
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyCount}
                    disabled={userEnteredCount.trim() === ''}
                    className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm text-white shadow-lg shadow-emerald-950 transition-all"
                  >
                    Verify Count [Enter]
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                    auditResult.correct
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                  }`}
                >
                  {auditResult.correct ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {auditResult.correct ? 'Spot On! Count Perfect' : 'Count Discrepancy!'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {auditResult.correct
                      ? 'You have tracked every card flawlessly.'
                      : `You were off by ${Math.abs(auditResult.diff)}.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-slate-950 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <div className="text-xs text-slate-400">Your Estimate</div>
                    <div
                      className={`text-2xl font-bold mt-0.5 ${
                        auditResult.correct ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {auditResult.userCount > 0 ? `+${auditResult.userCount}` : auditResult.userCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Actual Running Count</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                      {auditResult.actualCount > 0 ? `+${auditResult.actualCount}` : auditResult.actualCount}
                    </div>
                  </div>
                </div>

                <button
                  onClick={resumeAfterAudit}
                  autoFocus
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg transition-all"
                >
                  Continue Drill [Space]
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
