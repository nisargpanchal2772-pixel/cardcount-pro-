import React, { useEffect } from 'react';
import { CoachFeedback } from '../../lib/blackjack/types';
import { AlertCircle, CheckCircle2, ShieldAlert, Zap, X } from 'lucide-react';

interface CoachModalProps {
  feedback: CoachFeedback | null;
  onClose: () => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({ feedback, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    if (feedback) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, onClose]);

  if (!feedback) return null;

  const isPositive = feedback.type === 'correct' || feedback.type === 'deviation_correct';
  const isDeviation = feedback.type === 'deviation_correct' || feedback.type === 'deviation_error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border rounded-2xl shadow-2xl overflow-hidden text-slate-100 transition-all border-slate-700/80"
        style={{
          boxShadow: isPositive
            ? '0 20px 50px -10px rgba(16, 185, 129, 0.3)'
            : '0 20px 50px -10px rgba(244, 63, 94, 0.3)',
        }}
      >
        {/* Header bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isPositive
              ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'deviation_correct' ? (
              <Zap className="w-6 h-6 text-amber-400" />
            ) : isPositive ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : feedback.type === 'deviation_error' ? (
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            )}
            <h3 className="text-lg font-bold tracking-tight text-white">{feedback.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Your Action</span>
              <span
                className={`text-xl font-extrabold font-mono mt-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400 line-through'
                }`}
              >
                {feedback.actionTaken}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Optimal Play</span>
              <span className="text-xl font-extrabold font-mono mt-1 text-emerald-400">
                {feedback.recommendedAction}
              </span>
            </div>
          </div>

          {/* Counts Audit Row */}
          <div className="flex items-center justify-around py-2.5 px-4 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-sm">
            <div className="text-center">
              <div className="text-xs text-slate-400">Running Count</div>
              <div className="font-bold text-slate-200">
                {feedback.runningCount > 0 ? `+${feedback.runningCount}` : feedback.runningCount}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Decks Left</div>
              <div className="font-bold text-slate-200">{feedback.decksRemaining.toFixed(1)}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-xs text-amber-400 font-semibold">True Count</div>
              <div className="font-bold text-amber-400 text-base">
                {feedback.trueCount > 0 ? `+${feedback.trueCount}` : feedback.trueCount}
              </div>
            </div>
          </div>

          {/* Illustrious 18 Rule Info if applicable */}
          {feedback.rule && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {feedback.rule.rankIndex <= 18 ? `Illustrious 18 #${feedback.rule.rankIndex}` : 'Fab 4 Surrender'} —{' '}
                  {feedback.rule.name}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                Trigger Index: <strong className="font-mono text-amber-300">{feedback.rule.comparison} {feedback.rule.triggerIndex}</strong> | Expected Gain:{' '}
                <span className="text-emerald-300 font-semibold">{feedback.rule.evImpact}</span>
              </p>
            </div>
          )}

          {/* Math & Game Theory Explanation */}
          <div className="space-y-1.5">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">
              Mathematical Game Theory
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
              {feedback.mathematicalDetail || feedback.message}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Press [Space] or [Enter] to resume</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            Resume Table
          </button>
        </div>
      </div>
    </div>
  );
};
