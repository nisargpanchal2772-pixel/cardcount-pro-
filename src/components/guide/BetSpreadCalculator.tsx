import React, { useState } from 'react';
import { Coins, TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

export const BetSpreadCalculator: React.FC = () => {
  const [bankroll, setBankroll] = useState<number>(10000);
  const [baseUnit, setBaseUnit] = useState<number>(25);
  const [spreadType, setSpreadType] = useState<'shoe' | 'pitch'>('shoe'); // shoe = 1-12, pitch = 1-8

  const spreadMultipliers = spreadType === 'shoe'
    ? [
        { tc: '<= 1', mult: 1, edge: '-0.5% (House Edge)', kelly: '0%' },
        { tc: '+2', mult: 2, edge: '+0.5% (Player Edge)', kelly: '1/4 Kelly' },
        { tc: '+3', mult: 4, edge: '+1.0%', kelly: '1/2 Kelly' },
        { tc: '+4', mult: 8, edge: '+1.5%', kelly: 'Full Kelly' },
        { tc: '+5+', mult: 12, edge: '+2.0%+', kelly: 'Max Spread' },
      ]
    : [
        { tc: '<= 1', mult: 1, edge: '-0.5%', kelly: '0%' },
        { tc: '+2', mult: 2, edge: '+0.6%', kelly: '1/4 Kelly' },
        { tc: '+3', mult: 4, edge: '+1.2%', kelly: '1/2 Kelly' },
        { tc: '+4+', mult: 8, edge: '+1.8%+', kelly: 'Full Kelly' },
      ];

  const totalBankrollUnits = Math.floor(bankroll / baseUnit);
  const maxBet = baseUnit * (spreadType === 'shoe' ? 12 : 8);
  const riskOfRuinEstimate = totalBankrollUnits >= 400 ? '< 1%' : totalBankrollUnits >= 250 ? '3% - 5%' : '> 15%';

  return (
    <div className="w-full space-y-6">
      {/* Parameters Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
            Total Bankroll ($)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              step="500"
              value={bankroll}
              onChange={(e) => setBankroll(Math.max(100, parseInt(e.target.value, 10) || 0))}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
            Base Betting Unit ($)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              step="5"
              value={baseUnit}
              onChange={(e) => setBaseUnit(Math.max(5, parseInt(e.target.value, 10) || 0))}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
            Shoe Format & Bet Spread
          </label>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setSpreadType('shoe')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                spreadType === 'shoe'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6-Deck (1 to 12)
            </button>
            <button
              onClick={() => setSpreadType('pitch')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                spreadType === 'pitch'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2-Deck (1 to 8)
            </button>
          </div>
        </div>
      </div>

      {/* Bankroll Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 font-sans">Bankroll in Units</div>
          <div className="text-2xl font-bold text-white mt-1">{totalBankrollUnits} Units</div>
          <div className="text-[11px] text-slate-500 mt-1">Recommended: 400+ units</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 font-sans">Max Top Bet</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">${maxBet}</div>
          <div className="text-[11px] text-slate-500 mt-1">At TC +5 or higher</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 font-sans">Estimated Risk of Ruin (RoR)</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              totalBankrollUnits >= 400
                ? 'text-emerald-400'
                : totalBankrollUnits >= 250
                ? 'text-amber-400'
                : 'text-rose-500'
            }`}
          >
            {riskOfRuinEstimate}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalBankrollUnits >= 400 ? 'Safe professional sizing' : 'Over-betting risk'}
          </div>
        </div>
      </div>

      {/* Recommended Scaling Ramp Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">True Count</th>
              <th className="py-3 px-4">Bet Units</th>
              <th className="py-3 px-4 text-emerald-400">Actual Bet ($)</th>
              <th className="py-3 px-4">Player Advantage</th>
              <th className="py-3 px-4">Kelly Fraction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {spreadMultipliers.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-amber-300">{row.tc}</td>
                <td className="py-3.5 px-4 font-bold text-slate-200">{row.mult} Unit(s)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                  ${row.mult * baseUnit}
                </td>
                <td className="py-3.5 px-4 text-slate-300">{row.edge}</td>
                <td className="py-3.5 px-4 text-slate-400">{row.kelly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pro Tip */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200/90 leading-relaxed">
        <strong className="text-emerald-400 font-mono block mb-1">
          Why Bet Spread is 85% of Card Counting Profitability:
        </strong>
        Card counting without a bet spread has a negative expected value! You only hold an edge over the house
        when the shoe is rich in 10s and Aces (True Count +2 or higher). Scaling your wager proportionally to
        your mathematical edge via Kelly betting is the engine of card counting profit.
      </div>
    </div>
  );
};
