import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Eye,
  EyeOff,
  Layers,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { sounds } from '../../lib/audio';
import { haptics } from '../../lib/haptics';

export const SettingsDrawer: React.FC = () => {
  const {
    isSettingsOpen,
    toggleSettings,
    soundEnabled,
    toggleSound,
    hapticsEnabled,
    toggleHaptics,
    countVisibility,
    toggleCountVisibility,
    roundingMode,
    setRoundingMode,
    dealerRule,
    setDealerRule,
    deckCount,
    setDeckCount,
    resetLiveBankroll,
    stats,
  } = useAppStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto text-slate-100 shadow-2xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ⚙
              </div>
              <div>
                <h3 className="text-base font-bold text-white">App & Table Settings</h3>
                <p className="text-[11px] text-slate-400 font-mono">Customize rules & hardware</p>
              </div>
            </div>
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback & Hardware Controls */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Audio & Haptics
            </span>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">Sound Effects</div>
                  <div className="text-[10px] text-slate-400">Card flips, chip bets, error thuds</div>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleSound();
                  sounds.playCardFlip();
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Vibrations Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Vibrate className={`w-4 h-4 ${hapticsEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-semibold text-white">Device Haptics</div>
                  <div className="text-[10px] text-slate-400">Tactile vibration on flips & mistakes</div>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleHaptics();
                  haptics.impactMedium();
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hapticsEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Stealth Count Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {countVisibility === 'visible' ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">Count Assist</div>
                  <div className="text-[10px] text-slate-400">
                    {countVisibility === 'visible' ? 'Visible during live play' : 'Stealth (Hidden)'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleCountVisibility}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  countVisibility === 'visible' ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Table Game Rules */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Casino Table Rules
            </span>

            {/* Decks in Shoe */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Shoe Size</span>
                <span className="text-amber-400 font-bold font-mono">{deckCount} Decks</span>
              </div>
              <div className="grid grid-cols-4 gap-1 font-mono text-xs">
                {[1, 2, 6, 8].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDeckCount(d);
                      haptics.impactLight();
                    }}
                    className={`py-1.5 rounded-lg border transition-all ${
                      deckCount === d
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d} {d === 1 ? 'Deck' : 'Decks'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dealer Soft 17 Rule */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Dealer Soft 17 Rule</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {dealerRule === 's17' ? 'Stand on S17' : 'Hit on S17'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                <button
                  onClick={() => {
                    setDealerRule('s17');
                    haptics.impactLight();
                  }}
                  className={`py-1.5 rounded-lg border transition-all ${
                    dealerRule === 's17'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  S17 (Standard)
                </button>
                <button
                  onClick={() => {
                    setDealerRule('h17');
                    haptics.impactLight();
                  }}
                  className={`py-1.5 rounded-lg border transition-all ${
                    dealerRule === 'h17'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  H17 (Vegas Strip)
                </button>
              </div>
            </div>

            {/* True Count Rounding Convention */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">TC Division Rounding</span>
                <span className="text-blue-400 font-bold font-mono uppercase">{roundingMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 font-mono text-xs">
                {(['floor', 'truncate', 'round'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRoundingMode(r);
                      haptics.impactLight();
                    }}
                    className={`py-1.5 rounded-lg border transition-all capitalize ${
                      roundingMode === r
                        ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Bankroll Button */}
          <div className="pt-2">
            <button
              onClick={resetLiveBankroll}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bankroll to $1,000</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-6 border-t border-slate-900 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-white">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>CardCount Pro Mobile v1.0.0</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            100% Offline • Zero Ads • Native iOS & Android
          </p>
        </div>
      </div>
    </div>
  );
};
