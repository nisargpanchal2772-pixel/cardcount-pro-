import React from 'react';
import { useAppStore, DrillMode } from '../../lib/store';
import { Zap, Users, Layers, Sparkles, BookOpen } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentTab, setTab } = useAppStore();

  const navItems: { id: DrillMode; label: string; icon: React.ReactNode; isAccent?: boolean }[] = [
    { id: 'speed', label: 'Speed', icon: <Zap className="w-5 h-5" /> },
    { id: 'cancellation', label: 'Cancel', icon: <Users className="w-5 h-5" /> },
    { id: 'discard', label: 'Discard', icon: <Layers className="w-5 h-5" /> },
    { id: 'live', label: 'Live Table', icon: <Sparkles className="w-5 h-5 text-amber-400" />, isAccent: true },
    { id: 'guide', label: 'Guide', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-950/80 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow background pill */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/30 to-emerald-500/10 border border-emerald-500/40 rounded-2xl shadow-lg shadow-emerald-950" />
              )}

              <div className={`relative z-10 ${isActive ? 'scale-110 text-emerald-400' : ''} transition-transform`}>
                {item.icon}
              </div>

              <span className={`relative z-10 text-[10px] font-mono tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
