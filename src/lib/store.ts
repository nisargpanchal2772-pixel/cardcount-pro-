import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoachFeedback, RoundingMode } from './blackjack/types';
import { sounds } from './audio';
import { haptics } from './haptics';

export type DrillMode = 'speed' | 'cancellation' | 'discard' | 'live' | 'guide';

export type CountVisibility = 'visible' | 'hidden' | 'peek';

export type DealerRule = 's17' | 'h17';

interface AppState {
  currentTab: DrillMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  countVisibility: CountVisibility;
  roundingMode: RoundingMode;
  dealerRule: DealerRule;
  deckCount: number;
  penetration: number;
  showHotkeyLegend: boolean;
  isSettingsOpen: boolean;
  coachFeedback: CoachFeedback | null;

  // Global Statistics
  stats: {
    speed: {
      cardsViewed: number;
      correctChecks: number;
      totalChecks: number;
      currentStreak: number;
      bestStreak: number;
      avgReactionMs: number;
    };
    cancellation: {
      roundsCompleted: number;
      correctRounds: number;
      currentStreak: number;
      bestStreak: number;
    };
    discard: {
      totalEstimates: number;
      correctEstimates: number;
      currentStreak: number;
      bestStreak: number;
    };
    live: {
      handsPlayed: number;
      handsWon: number;
      handsLost: number;
      handsPushed: number;
      basicErrors: number;
      deviationsExecuted: number;
      deviationsMissed: number;
      bankroll: number;
      startingBankroll: number;
    };
  };

  // Actions
  setTab: (tab: DrillMode) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setCountVisibility: (mode: CountVisibility) => void;
  toggleCountVisibility: () => void;
  setRoundingMode: (mode: RoundingMode) => void;
  setDealerRule: (rule: DealerRule) => void;
  setDeckCount: (decks: number) => void;
  setPenetration: (pen: number) => void;
  toggleHotkeyLegend: () => void;
  toggleSettings: () => void;
  setCoachFeedback: (feedback: CoachFeedback | null) => void;

  // Stat Recorders
  recordSpeedResult: (correct: boolean, reactionMs?: number) => void;
  recordCancellationResult: (correct: boolean) => void;
  recordDiscardResult: (correctDeck: boolean, correctTc: boolean) => void;
  recordLiveHandResult: (
    outcome: 'won' | 'lost' | 'push',
    netProfit: number,
    basicCorrect: boolean,
    deviationEvent?: 'executed' | 'missed'
  ) => void;
  resetLiveBankroll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTab: 'speed',
      soundEnabled: true,
      hapticsEnabled: true,
      countVisibility: 'visible',
      roundingMode: 'floor',
      dealerRule: 's17',
      deckCount: 6,
      penetration: 75,
      showHotkeyLegend: false,
      isSettingsOpen: false,
      coachFeedback: null,

      stats: {
        speed: {
          cardsViewed: 0,
          correctChecks: 0,
          totalChecks: 0,
          currentStreak: 0,
          bestStreak: 0,
          avgReactionMs: 0,
        },
        cancellation: {
          roundsCompleted: 0,
          correctRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
        discard: {
          totalEstimates: 0,
          correctEstimates: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
        live: {
          handsPlayed: 0,
          handsWon: 0,
          handsLost: 0,
          handsPushed: 0,
          basicErrors: 0,
          deviationsExecuted: 0,
          deviationsMissed: 0,
          bankroll: 1000,
          startingBankroll: 1000,
        },
      },

      setTab: (tab) => {
        haptics.impactLight();
        set({ currentTab: tab });
      },

      toggleSound: () => {
        const muted = sounds.toggleMute();
        set({ soundEnabled: !muted });
      },

      toggleHaptics: () => {
        const next = !get().hapticsEnabled;
        haptics.setEnabled(next);
        set({ hapticsEnabled: next });
        if (next) haptics.impactMedium();
      },

      setCountVisibility: (visibility) => set({ countVisibility: visibility }),

      toggleCountVisibility: () => {
        const cur = get().countVisibility;
        const next = cur === 'visible' ? 'hidden' : 'visible';
        haptics.impactLight();
        set({ countVisibility: next });
      },

      setRoundingMode: (mode) => set({ roundingMode: mode }),

      setDealerRule: (rule) => set({ dealerRule: rule }),

      setDeckCount: (decks) => set({ deckCount: decks }),

      setPenetration: (pen) => set({ penetration: pen }),

      toggleHotkeyLegend: () => set((state) => ({ showHotkeyLegend: !state.showHotkeyLegend })),

      toggleSettings: () => {
        haptics.impactLight();
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
      },

      setCoachFeedback: (feedback) => {
        if (feedback) {
          if (feedback.type === 'correct' || feedback.type === 'deviation_correct') {
            haptics.notificationSuccess();
          } else {
            haptics.notificationError();
          }
        }
        set({ coachFeedback: feedback });
      },

      recordSpeedResult: (correct, reactionMs) => {
        if (correct) {
          haptics.notificationSuccess();
        } else {
          haptics.notificationError();
        }

        set((state) => {
          const sp = state.stats.speed;
          const currentStreak = correct ? sp.currentStreak + 1 : 0;
          const bestStreak = Math.max(sp.bestStreak, currentStreak);
          const totalChecks = sp.totalChecks + 1;
          const correctChecks = sp.correctChecks + (correct ? 1 : 0);

          let avgReactionMs = sp.avgReactionMs;
          if (reactionMs && reactionMs > 0) {
            avgReactionMs = sp.avgReactionMs === 0 ? reactionMs : Math.round((sp.avgReactionMs * 0.8) + (reactionMs * 0.2));
          }

          return {
            stats: {
              ...state.stats,
              speed: {
                ...sp,
                totalChecks,
                correctChecks,
                currentStreak,
                bestStreak,
                avgReactionMs,
              },
            },
          };
        });
      },

      recordCancellationResult: (correct) => {
        if (correct) {
          haptics.notificationSuccess();
        } else {
          haptics.notificationError();
        }

        set((state) => {
          const c = state.stats.cancellation;
          const currentStreak = correct ? c.currentStreak + 1 : 0;
          const bestStreak = Math.max(c.bestStreak, currentStreak);
          return {
            stats: {
              ...state.stats,
              cancellation: {
                roundsCompleted: c.roundsCompleted + 1,
                correctRounds: c.correctRounds + (correct ? 1 : 0),
                currentStreak,
                bestStreak,
              },
            },
          };
        });
      },

      recordDiscardResult: (correctDeck, correctTc) => {
        const fullyCorrect = correctDeck && correctTc;
        if (fullyCorrect) {
          haptics.notificationSuccess();
        } else {
          haptics.notificationError();
        }

        set((state) => {
          const d = state.stats.discard;
          const currentStreak = fullyCorrect ? d.currentStreak + 1 : 0;
          const bestStreak = Math.max(d.bestStreak, currentStreak);
          return {
            stats: {
              ...state.stats,
              discard: {
                totalEstimates: d.totalEstimates + 1,
                correctEstimates: d.correctEstimates + (fullyCorrect ? 1 : 0),
                currentStreak,
                bestStreak,
              },
            },
          };
        });
      },

      recordLiveHandResult: (outcome, netProfit, basicCorrect, deviationEvent) => {
        if (outcome === 'won') {
          haptics.notificationSuccess();
        } else if (outcome === 'lost') {
          haptics.notificationError();
        }

        set((state) => {
          const l = state.stats.live;
          return {
            stats: {
              ...state.stats,
              live: {
                ...l,
                handsPlayed: l.handsPlayed + 1,
                handsWon: l.handsWon + (outcome === 'won' ? 1 : 0),
                handsLost: l.handsLost + (outcome === 'lost' ? 1 : 0),
                handsPushed: l.handsPushed + (outcome === 'push' ? 1 : 0),
                basicErrors: l.basicErrors + (basicCorrect ? 0 : 1),
                deviationsExecuted: l.deviationsExecuted + (deviationEvent === 'executed' ? 1 : 0),
                deviationsMissed: l.deviationsMissed + (deviationEvent === 'missed' ? 1 : 0),
                bankroll: l.bankroll + netProfit,
              },
            },
          };
        });
      },

      resetLiveBankroll: () => {
        haptics.impactMedium();
        set((state) => ({
          stats: {
            ...state.stats,
            live: {
              ...state.stats.live,
              bankroll: 1000,
            },
          },
        }));
      },
    }),
    {
      name: 'cardcount_pro_storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        countVisibility: state.countVisibility,
        roundingMode: state.roundingMode,
        dealerRule: state.dealerRule,
        deckCount: state.deckCount,
        penetration: state.penetration,
        stats: state.stats,
      }),
    }
  )
);
