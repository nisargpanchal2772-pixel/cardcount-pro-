import React, { useState } from 'react';
import { ALL_DEVIATIONS } from '../../lib/blackjack/deviations';
import { DeviationRule } from '../../lib/blackjack/types';
import { Zap, Search, Filter, HelpCircle, Check, X } from 'lucide-react';

export const Illustrious18Table: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'hard' | 'pair' | 'insurance'>('all');
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizGuesses, setQuizGuesses] = useState<Record<string, number>>({});
  const [revealedRules, setRevealedRules] = useState<Record<string, boolean>>({});

  const filteredRules = ALL_DEVIATIONS.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.playerHandDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.dealerUpcard.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'insurance'
        ? rule.playerHandType === 'insurance'
        : rule.playerHandType === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleGuess = (ruleId: string, value: number) => {
    setQuizGuesses((prev) => ({ ...prev, [ruleId]: value }));
  };

  const toggleReveal = (ruleId: string) => {
    setRevealedRules((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Filter & Quiz Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 font-mono text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search hands (e.g. 16 vs 10, 12, 10-10)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Hand Type Filter */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 hidden sm:inline" />
          {[
            { id: 'all', label: 'All (18+4)' },
            { id: 'hard', label: 'Hard Totals' },
            { id: 'pair', label: 'Pairs' },
            { id: 'insurance', label: 'Insurance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quiz Recall Mode Toggle */}
        <button
          onClick={() => setQuizMode(!quizMode)}
          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border transition-all ${
            quizMode
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
              : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz Recall Mode: {quizMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Deviations Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Rank</th>
              <th className="py-3.5 px-4">Player Hand</th>
              <th className="py-3.5 px-4">Dealer Upcard</th>
              <th className="py-3.5 px-4">Basic Strategy</th>
              <th className="py-3.5 px-4 text-amber-400">Deviation Trigger</th>
              <th className="py-3.5 px-4">Deviation Action</th>
              <th className="py-3.5 px-4">EV Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRules.map((rule) => {
              const isRevealed = revealedRules[rule.id] || !quizMode;
              const userGuess = quizGuesses[rule.id];
              const isCorrectGuess = userGuess !== undefined && userGuess === rule.triggerIndex;

              return (
                <tr
                  key={rule.id}
                  className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                  onClick={() => toggleReveal(rule.id)}
                >
                  {/* Rank Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                        rule.rankIndex <= 3
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : rule.rankIndex <= 18
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {rule.rankIndex}
                    </span>
                  </td>

                  {/* Player Hand */}
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {rule.playerHandDesc}
                  </td>

                  {/* Dealer Upcard */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-amber-300">
                      {rule.dealerUpcard}
                    </span>
                  </td>

                  {/* Basic Strategy Baseline */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase font-semibold">
                      {rule.basicAction}
                    </span>
                  </td>

                  {/* Trigger Index (Quiz Mode or Revealed) */}
                  <td className="py-3.5 px-4">
                    {!quizMode || isRevealed ? (
                      <span className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/40 text-amber-400 font-extrabold text-sm">
                        TC {rule.comparison} {rule.triggerIndex > 0 ? `+${rule.triggerIndex}` : rule.triggerIndex}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          placeholder="TC ?"
                          value={userGuess !== undefined ? userGuess : ''}
                          onChange={(e) => handleGuess(rule.id, parseInt(e.target.value, 10))}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-400 font-bold"
                        />
                        {userGuess !== undefined && (
                          <span className={isCorrectGuess ? 'text-emerald-400' : 'text-rose-400'}>
                            {isCorrectGuess ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Deviation Action */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold uppercase">
                      {rule.deviationAction}
                    </span>
                  </td>

                  {/* EV Gain */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-400 font-sans">
                    {rule.evImpact}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 font-mono text-center">
        * Ranked in order of mathematical expected value (EV) contribution to the card counter.
      </div>
    </div>
  );
};
