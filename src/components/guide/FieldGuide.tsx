import React, { useState } from 'react';
import { Illustrious18Table } from './Illustrious18Table';
import { BetSpreadCalculator } from './BetSpreadCalculator';
import { BookOpen, ChevronDown, ChevronUp, Zap, Target, Layers, ShieldCheck, Eye } from 'lucide-react';
import { CardView } from '../common/CardView';

export const FieldGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>('hilo');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6 select-none">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>OFFICIAL FIELD MANUAL & MATHEMATICS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hi-Lo Game Theory & Strategy Hub
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto font-sans">
          The exact mathematical principles, counting indexes, and bet spread formulas required to beat the casino.
        </p>
      </div>

      {/* Accordion Module 1: Hi-Lo System Foundation */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('hilo')}
          className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hi-Lo System Point Values</h3>
              <p className="text-xs text-slate-400">Card point tagging (+1, 0, -1) and why it works</p>
            </div>
          </div>
          {openSection === 'hilo' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSection === 'hilo' && (
          <div className="p-6 space-y-6 border-t border-slate-800/60">
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Developed by Harvey Dubner in 1963, <strong>Hi-Lo</strong> is a balanced counting system that tracks the ratio of high cards (10s and Aces) to low cards (2 through 6). Because a standard deck contains exactly twenty 2-6s and twenty 10-As, the total count of an unplayed deck is always exactly <strong>0</strong>.
            </p>

            {/* Visual Value Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* +1 Cards */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Low Cards (Good for Dealer)
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 my-1">+1</div>
                <div className="text-xs text-slate-400 mb-3">Ranks: 2, 3, 4, 5, 6</div>
                <div className="flex gap-1">
                  {['2', '3', '4', '5', '6'].map((r) => (
                    <span key={r} className="w-7 h-9 rounded bg-white text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow">
                      {r}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-tight">
                  When these cards leave the shoe, the remaining shoe becomes richer in high cards. Add +1 to your count!
                </p>
              </div>

              {/* 0 Cards */}
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Neutral Cards
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-300 my-1">0</div>
                <div className="text-xs text-slate-400 mb-3">Ranks: 7, 8, 9</div>
                <div className="flex gap-1">
                  {['7', '8', '9'].map((r) => (
                    <span key={r} className="w-7 h-9 rounded bg-white text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow">
                      {r}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-tight">
                  These cards have minimal impact on player or dealer advantage. Ignore them completely.
                </p>
              </div>

              {/* -1 Cards */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">
                  High Cards (Power Cards)
                </div>
                <div className="text-3xl font-extrabold font-mono text-rose-400 my-1">-1</div>
                <div className="text-xs text-slate-400 mb-3">Ranks: 10, J, Q, K, A</div>
                <div className="flex gap-1">
                  {['10', 'J', 'Q', 'K', 'A'].map((r) => (
                    <span key={r} className="w-7 h-9 rounded bg-white text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow">
                      {r}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-tight">
                  High cards produce natural 3:2 blackjacks and bust stiff dealer hands. Subtract 1 when you see one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Module 2: Running Count vs True Count Conversion */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('conversion')}
          className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Running Count vs. True Count Conversion</h3>
              <p className="text-xs text-slate-400">The mathematical division formula and rounding conventions</p>
            </div>
          </div>
          {openSection === 'conversion' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSection === 'conversion' && (
          <div className="p-6 space-y-6 border-t border-slate-800/60">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                The Master Conversion Formula
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
                True Count = Running Count ÷ Decks Remaining
              </div>
              <div className="text-xs text-slate-400 mt-1 font-sans">
                Always estimate decks remaining in the discard rack to the nearest half-deck (0.5).
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-slate-300">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-emerald-400">
                  Why Running Count Alone is Misleading
                </h4>
                <p className="leading-relaxed">
                  A Running Count of <strong>+6</strong> with 5.5 decks remaining represents a tiny surplus of only ~1 extra ten per deck (True Count +1). But a Running Count of <strong>+6</strong> with only 1.5 decks remaining means a True Count of <strong>+4</strong> — a massive player advantage where the deck is saturated with tens!
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-amber-400">
                  Floor vs. Truncate vs. Round
                </h4>
                <p className="leading-relaxed">
                  Most modern professional teams utilize <strong>Flooring</strong> (e.g. +3.8 rounds down to +3; -1.2 floors to -2) because index deviations were historically calculated and optimized under floor conventions. CardCount Pro supports Floor, Truncate, and Round in settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Module 3: Bet Spread & Bankroll Calculator */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('spread')}
          className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bet Spread & Bankroll Calculator</h3>
              <p className="text-xs text-slate-400">Kelly criterion scaling, edge per TC, and Risk of Ruin</p>
            </div>
          </div>
          {openSection === 'spread' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSection === 'spread' && (
          <div className="p-6 border-t border-slate-800/60">
            <BetSpreadCalculator />
          </div>
        )}
      </div>

      {/* Accordion Module 4: Interactive Illustrious 18 Matrix */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('i18')}
          className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Illustrious 18 & Fab 4 Matrix</h3>
              <p className="text-xs text-slate-400">
                Dr. Don Schlesinger&apos;s 18 most lucrative playing deviations
              </p>
            </div>
          </div>
          {openSection === 'i18' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSection === 'i18' && (
          <div className="p-6 border-t border-slate-800/60">
            <p className="text-sm text-slate-300 mb-4 font-sans leading-relaxed">
              Dr. Don Schlesinger computed that these 18 index deviations capture over <strong>80%</strong> of the total gain possible from all hundreds of computer deviations combined. Memorizing these 18 gives you table-ready mastery.
            </p>
            <Illustrious18Table />
          </div>
        )}
      </div>

      {/* Accordion Module 5: Casino Stealth & Longevity */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('stealth')}
          className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Casino Stealth & Table Longevity</h3>
              <p className="text-xs text-slate-400">How to avoid casino counter-measures and table heat</p>
            </div>
          </div>
          {openSection === 'stealth' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSection === 'stealth' && (
          <div className="p-6 space-y-4 border-t border-slate-800/60 text-xs font-sans text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-amber-400">
                  1. Never Move Your Lips
                </h4>
                <p>
                  Floor supervisors and cameras look for subtle lip twitches or head nodding as cards come out. Practice until count updates occur as instant subconscious impressions.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-emerald-400">
                  2. Keep Bet Jumps Smooth
                </h4>
                <p>
                  Avoid jumping from $25 straight to $300 in a single hand if the pit boss is watching. Parlaying chips or adding chips after a win looks more natural to casino surveillance.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-blue-400">
                  3. Wonging & Table Exits
                </h4>
                <p>
                  When the True Count plunges to -2 or below, leave the table to use the restroom, make a phone call, or find a fresh shoe. Playing through deeply negative counts destroys your hourly EV.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white font-mono text-sm mb-1 text-purple-400">
                  4. Limit Session Length
                </h4>
                <p>
                  Never play more than 45-60 minutes at a single table or single casino shift. Short hit-and-run sessions protect your identity and prevent surveillance review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
