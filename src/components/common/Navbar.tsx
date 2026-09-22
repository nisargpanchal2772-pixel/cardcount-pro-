import React from 'react';
import { useAppStore, DrillMode } from '../../lib/store';
import {
  Zap,
  Users,
  Layers,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Keyboard,
  Coins,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setTab,
    soundEnabled,
    toggleSound,
    countVisibility,
    toggleCountVisibility,
    toggleHotkeyLegend,
    toggleSettings,
    stats,
  } = useAppStore();

  const navItems: { id: DrillMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'speed', label: 'Speed Drill', icon: <Zap className="w-4 h-4" /> },
    { id: 'cancellation', label: 'Pair Cancel', icon: <Users className="w-4 h-4" /> },
    { id: 'discard', label: 'Discard & TC', icon: <Layers className="w-4 h-4" /> },
    { id: 'live', label: 'Live Table', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'Audited' },
    { id: 'guide', label: 'Field Guide', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/80 bg-slate-950/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          onClick={() => setTab('speed')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 p-0.5 shadow-lg shadow-emerald-950 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-black text-amber-400 text-sm sm:text-base">
              ♠
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white font-sans">
                CardCount <span className="text-amber-400">Pro</span>
              </span>
              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline-block">
                Mobile
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right utility toolbar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Live Bankroll Badge */}
          {currentTab === 'live' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>${stats.live.bankroll}</span>
            </div>
          )}

          {/* Stealth Count Toggle */}
          <button
            onClick={toggleCountVisibility}
            title={countVisibility === 'visible' ? 'Stealth Mode [C]' : 'Show counts [C]'}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              countVisibility === 'visible'
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-amber-950/40 border-amber-600/40 text-amber-300'
            }`}
          >
            {countVisibility === 'visible' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{countVisibility === 'visible' ? 'Count Visible' : 'Stealth'}</span>
          </button>

          {/* Sound Toggle (Desktop/Tablet) */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound [M]' : 'Unmute Sound [M]'}
            className="hidden sm:flex p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Keyboard Shortcuts Dialog (Desktop only) */}
          <button
            onClick={toggleHotkeyLegend}
            title="Keyboard Shortcuts"
            className="hidden lg:flex p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Settings Drawer Trigger (Mobile & Desktop) */}
          <button
            onClick={toggleSettings}
            title="App Settings"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
