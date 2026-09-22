import React, { useEffect } from 'react';
import { useAppStore } from './lib/store';
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { SettingsDrawer } from './components/common/SettingsDrawer';
import { CoachModal } from './components/common/CoachModal';
import { HotkeyLegend } from './components/common/HotkeyLegend';
import { SpeedDrill } from './components/drills/SpeedDrill';
import { CancellationDrill } from './components/drills/CancellationDrill';
import { DiscardTrayDrill } from './components/drills/DiscardTrayDrill';
import { LiveSimulation } from './components/drills/LiveSimulation';
import { FieldGuide } from './components/guide/FieldGuide';
import { Wifi, Sparkles } from 'lucide-react';

export function App() {
  const {
    currentTab,
    coachFeedback,
    setCoachFeedback,
    showHotkeyLegend,
    toggleHotkeyLegend,
    toggleSound,
    toggleCountVisibility,
  } = useAppStore();

  // Global key listener for desktop keyboard users
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'm') {
        e.preventDefault();
        toggleSound();
      } else if (key === 'c') {
        e.preventDefault();
        toggleCountVisibility();
      } else if (key === '?') {
        e.preventDefault();
        toggleHotkeyLegend();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleSound, toggleCountVisibility, toggleHotkeyLegend]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#040907] text-slate-100 selection:bg-emerald-500 selection:text-white pb-20 md:pb-0">
      {/* Top Header */}
      <Navbar />

      {/* Main Interactive View */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
        {currentTab === 'speed' && <SpeedDrill />}
        {currentTab === 'cancellation' && <CancellationDrill />}
        {currentTab === 'discard' && <DiscardTrayDrill />}
        {currentTab === 'live' && <LiveSimulation />}
        {currentTab === 'guide' && <FieldGuide />}
      </main>

      {/* Mobile Floating Bottom Dock */}
      <MobileBottomNav />

      {/* Slide-out Settings Drawer */}
      <SettingsDrawer />

      {/* Real-time Coach Modal for Audits */}
      <CoachModal feedback={coachFeedback} onClose={() => setCoachFeedback(null)} />

      {/* Keyboard Shortcuts Legend Modal */}
      <HotkeyLegend isOpen={showHotkeyLegend} onClose={toggleHotkeyLegend} />

      {/* Desktop Footer Ribbon */}
      <footer className="hidden md:block w-full border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-semibold">CardCount Pro</span>
            <span className="text-slate-600">—</span>
            <span>Mobile Ready (Android & iOS) • 100% Ad-Free</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-400/80">
              <Wifi className="w-3.5 h-3.5" />
              <span>Offline Ready (Service Worker Active)</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hi-Lo & Illustrious 18 Math</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
