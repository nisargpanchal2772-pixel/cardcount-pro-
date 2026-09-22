import React, { useState, useEffect, useCallback } from 'react';
import { DiscardTrayCanvas } from '../common/DiscardTrayCanvas';
import { calculateTrueCount } from '../../lib/blackjack/hilo';
import { sounds } from '../../lib/audio';
import { useAppStore } from '../../lib/store';
import { Layers, Check, X, ArrowRight, RotateCcw, HelpCircle, Calculator, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DiscardTrayDrill: React.FC = () => {
  const { stats, recordDiscardResult, roundingMode, setRoundingMode } = useAppStore();

  const totalShoeDecks = 6;

  // Problem state
  const [actualDiscardedDecks, setActualDiscardedDecks] = useState<number>(2.5);
  const [givenRunningCount, setGivenRunningCount] = useState<number>(8);

  // User input state
  const [userDecksRemaining, setUserDecksRemaining] = useState<number>(3.5);
  const [userTrueCount, setUserTrueCount] = useState<string>('');

  // Audit state
  const [isAudited, setIsAudited] = useState<boolean>(false);
  const [auditDetails, setAuditDetails] = useState<{
    actualDecksRemaining: number;
    deckDiff: number;
    deckCorrect: boolean;
    actualTrueCount: number;
    tcCorrect: boolean;
  } | null>(null);

  // Generate new random scenario
  const generateNewScenario = useCallback(() => {
    // Pick discarded decks in increments of 0.25 or 0.5 (from 0.5 to 5.5 decks)
    const steps = [0.5, 1.0, 1.5, 2.0, 2.25, 2.5, 3.0, 3.25, 3.5, 4.0, 4.5, 5.0];
    const pickedDiscarded = steps[Math.floor(Math.random() * steps.length)];

    // Pick a realistic running count between -15 and +20
    const counts = [-12, -9, -6, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
    const pickedRc = counts[Math.floor(Math.random() * counts.length)];

    setActualDiscardedDecks(pickedDiscarded);
    setGivenRunningCount(pickedRc);
    setUserDecksRemaining(3.0);
    setUserTrueCount('');
    setIsAudited(false);
    setAuditDetails(null);
  }, []);

  useEffect(() => {
    generateNewScenario();
  }, [generateNewScenario]);

  const handleAudit = () => {
    const actualRemaining = totalShoeDecks - actualDiscardedDecks;
    // Allow +/- 0.5 deck leeway for physical visual estimation
    const deckDiff = Math.abs(userDecksRemaining - actualRemaining);
    const deckCorrect = deckDiff <= 0.5;

    // True Count computed with actual decks vs user decks
    const actualTc = calculateTrueCount(givenRunningCount, actualRemaining, roundingMode);
    const parsedUserTc = parseInt(userTrueCount.trim(), 10);
    const tcCorrect = !isNaN(parsedUserTc) && parsedUserTc === actualTc;

    setAuditDetails({
      actualDecksRemaining: actualRemaining,
      deckDiff,
      deckCorrect,
      actualTrueCount: actualTc,
      tcCorrect,
    });
    setIsAudited(true);

    const fullSuccess = deckCorrect && tcCorrect;
    recordDiscardResult(deckCorrect, tcCorrect);

    if (fullSuccess) {
      sounds.playCorrect();
      confetti({
        particleCount: 50,
        spread: 60,
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
        if (isAudited) {
          generateNewScenario();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudited, generateNewScenario]);

  const rcSign = givenRunningCount > 0 ? `+${givenRunningCount}` : `${givenRunningCount}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center select-none">
      {/* Top Ribbons & Stats */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-center">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estimates</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{stats.discard.totalEstimates}</div>
          <div className="text-[10px] text-slate-500">{stats.discard.correctEstimates} accurate</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak</span>
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.discard.currentStreak}</div>
          <div className="text-[10px] text-slate-500">Best: {stats.discard.bestStreak}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Rounding Rule</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {(['floor', 'truncate', 'round'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRoundingMode(mode)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  roundingMode === mode ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-500">Casino standard: floor</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>True Count Formula</span>
          </div>
          <div className="text-xs font-mono text-emerald-400 font-bold mt-1.5">
            TC = RC / Decks Left
          </div>
          <div className="text-[10px] text-slate-500">Nearest half-deck</div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-around gap-8 shadow-2xl">
        {/* Left Side: Discard Tray Rendering */}
        <div className="flex flex-col items-center">
          <DiscardTrayCanvas
            totalDecks={totalShoeDecks}
            discardedDecks={actualDiscardedDecks}
            estimatedDecksRemaining={userDecksRemaining}
            showActualLine={isAudited}
            height={280}
          />

          <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
            <div className="text-xs text-slate-400">Tray Observation</div>
            <div className="text-sm font-semibold text-slate-300">
              {isAudited
                ? `Actual Discard: ${actualDiscardedDecks.toFixed(2)} decks`
                : 'Study tray stack thickness'}
            </div>
          </div>
        </div>

        {/* Right Side: Calculation & Input Station */}
        <div className="flex-1 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Running Count Display */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Given Running Count</span>
              <div className="text-xs text-slate-500 font-sans">Accumulated card count</div>
            </div>
            <div
              className={`text-3xl font-extrabold font-mono ${
                givenRunningCount > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {rcSign}
            </div>
          </div>

          {/* Slider: Decks Remaining Estimate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 font-semibold">1. Estimate Decks Remaining in Shoe:</span>
              <span className="text-amber-400 font-bold text-sm bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                {userDecksRemaining.toFixed(1)} decks
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="5.5"
              step="0.5"
              disabled={isAudited}
              value={userDecksRemaining}
              onChange={(e) => setUserDecksRemaining(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.5 deck</span>
              <span>2.5 decks</span>
              <span>4.0 decks</span>
              <span>5.5 decks</span>
            </div>
          </div>

          {/* True Count Division Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 font-semibold">2. Calculate True Count:</span>
              <span className="text-[11px] text-slate-500">
                {rcSign} ÷ {userDecksRemaining.toFixed(1)} = ?
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                disabled={isAudited}
                placeholder="Enter computed True Count"
                value={userTrueCount}
                onChange={(e) => setUserTrueCount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAudited) handleAudit();
                }}
                className="w-full text-center text-xl font-mono font-bold py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-400 focus:outline-none text-amber-300 placeholder:text-slate-600"
              />
            </div>

            {/* Quick TC Buttons */}
            {!isAudited && (
              <div className="grid grid-cols-6 gap-1 w-full font-mono text-xs pt-1">
                {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((tc) => (
                  <button
                    key={tc}
                    onClick={() => setUserTrueCount(String(tc))}
                    className="py-1 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 font-bold"
                  >
                    {tc > 0 ? `+${tc}` : tc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action / Audit Section */}
          {!isAudited ? (
            <button
              onClick={handleAudit}
              disabled={userTrueCount.trim() === ''}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-bold text-sm text-white shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <span>Audit Calculation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    auditDetails?.deckCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-1">
                    {auditDetails?.deckCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>Deck Thickness</span>
                  </div>
                  <div>Actual: {auditDetails?.actualDecksRemaining.toFixed(1)} decks</div>
                  <div>Your: {userDecksRemaining.toFixed(1)} decks</div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    auditDetails?.tcCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-1">
                    {auditDetails?.tcCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>True Count Math</span>
                  </div>
                  <div>Actual TC: {auditDetails?.actualTrueCount}</div>
                  <div>Your TC: {userTrueCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={generateNewScenario}
                  autoFocus
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Next Discard Problem [Space]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={generateNewScenario}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
