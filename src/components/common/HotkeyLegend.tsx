import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface HotkeyLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Next Card / Deal Hand / Resume Game' },
  { key: 'H', desc: 'Hit hand' },
  { key: 'S', desc: 'Stand on hand' },
  { key: 'D', desc: 'Double Down' },
  { key: 'P', desc: 'Split Pair' },
  { key: 'I', desc: 'Take / Decline Insurance' },
  { key: 'C', desc: 'Toggle Stealth Count (Visible / Hidden)' },
  { key: 'M', desc: 'Toggle Sound Mute' },
  { key: '1 - 9', desc: 'Quick bet chips or select count speed' },
];

export const HotkeyLegend: React.FC<HotkeyLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/50 border border-slate-800 text-sm"
            >
              <span className="text-slate-300">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xs font-bold shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
