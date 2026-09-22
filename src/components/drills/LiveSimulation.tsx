import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Card, Hand, PlayerAction } from '../../lib/blackjack/types';
import { createShoe, calculateHandTotal } from '../../lib/blackjack/deck';
import { calculateRunningCount, calculateDecksRemaining, calculateTrueCount } from '../../lib/blackjack/hilo';
import { evaluatePlayerAction, evaluateInsuranceDecision } from '../../lib/blackjack/basicStrategy';
import { CardView } from '../common/CardView';
import { sounds } from '../../lib/audio';
import { haptics } from '../../lib/haptics';
import { useAppStore } from '../../lib/store';
import {
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LiveSimulation: React.FC = () => {
  const {
    stats,
    recordLiveHandResult,
    countVisibility,
    setCoachFeedback,
    roundingMode,
    dealerRule,
    deckCount,
  } = useAppStore();

  // Shoe State
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(deckCount));
  const [dealtCardCount, setDealtCardCount] = useState<number>(0);
  const [dealtCardsHistory, setDealtCardsHistory] = useState<Card[]>([]);

  // Bet State
  const [currentBet, setCurrentBet] = useState<number>(25);
  const [gameStage, setGameStage] = useState<'betting' | 'insurance' | 'playing' | 'dealer' | 'settled'>('betting');

  // Hands State
  const [playerHands, setPlayerHands] = useState<Hand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [outcomeMessage, setOutcomeMessage] = useState<string>('');

  // Counts Math
  const totalCardsInShoe = deckCount * 52;
  const cardsRemaining = Math.max(0, totalCardsInShoe - dealtCardCount);
  const decksRemaining = useMemo(() => calculateDecksRemaining(cardsRemaining, true), [cardsRemaining]);
  const runningCount = useMemo(() => calculateRunningCount(dealtCardsHistory), [dealtCardsHistory]);
  const trueCount = useMemo(() => calculateTrueCount(runningCount, decksRemaining, roundingMode), [runningCount, decksRemaining, roundingMode]);

  // Recommended bet spread based on True Count
  const recommendedBetUnits = useMemo(() => {
    if (trueCount <= 1) return 1;
    if (trueCount === 2) return 2;
    if (trueCount === 3) return 4;
    if (trueCount === 4) return 6;
    return 8;
  }, [trueCount]);

  const baseUnit = 25;
  const recommendedBetAmount = recommendedBetUnits * baseUnit;

  // Initialize fresh shoe
  const resetShoe = useCallback(() => {
    const newShoe = createShoe(deckCount);
    setShoe(newShoe);
    setDealtCardCount(0);
    setDealtCardsHistory([]);
    setPlayerHands([]);
    setDealerCards([]);
    setGameStage('betting');
    setOutcomeMessage('');
    sounds.playShuffle();
    haptics.impactMedium();
  }, [deckCount]);

  // Deal Initial Blackjack Hand
  const startDeal = () => {
    if (gameStage !== 'betting') return;
    if (cardsRemaining < 26) {
      resetShoe();
      return;
    }

    haptics.impactMedium();
    let ptr = dealtCardCount;
    const c1 = shoe[ptr++];
    const d1 = shoe[ptr++]; // dealer upcard
    const c2 = shoe[ptr++];
    const d2 = shoe[ptr++]; // dealer hole card

    const newDealt = [c1, d1, c2, d2];
    setDealtCardCount(ptr);
    setDealtCardsHistory((prev) => [...prev, ...newDealt]);

    const pHand: Hand = {
      id: 'hand-1',
      cards: [c1, c2],
      bet: currentBet,
      isDoubled: false,
      isSplit: false,
      isBusted: false,
      isBlackjack: false,
      isStood: false,
      isSurrendered: false,
      status: 'playing',
    };

    setPlayerHands([pHand]);
    setActiveHandIndex(0);
    setDealerCards([d1, d2]);
    setOutcomeMessage('');

    sounds.playChip();
    setTimeout(() => sounds.playCardFlip(), 100);

    // Check for Dealer Ace (Insurance trigger)
    if (d1.rank === 'A') {
      setGameStage('insurance');
    } else {
      // Check for immediate Player Blackjack
      const { isBlackjack } = calculateHandTotal([c1, c2]);
      if (isBlackjack) {
        handleDealerTurn([pHand], [d1, d2]);
      } else {
        setGameStage('playing');
      }
    }
  };

  // Insurance Decision
  const handleInsurance = (takeInsurance: boolean) => {
    haptics.impactLight();
    const feedback = evaluateInsuranceDecision(takeInsurance, runningCount, trueCount, decksRemaining);
    if (feedback.type !== 'correct') {
      setCoachFeedback(feedback);
    }

    if (takeInsurance) {
      sounds.playChip();
    }

    // Check if dealer has Blackjack
    const dealerHasBJ = dealerCards[0].rank === 'A' && ['10', 'J', 'Q', 'K'].includes(dealerCards[1].rank);

    if (dealerHasBJ) {
      handleDealerTurn(playerHands, dealerCards);
    } else {
      setGameStage('playing');
    }
  };

  // Player Actions (Hit, Stand, Double, Split)
  const handlePlayerAction = (action: PlayerAction) => {
    if (gameStage !== 'playing') return;

    const currentHand = playerHands[activeHandIndex];
    if (!currentHand || currentHand.status !== 'playing') return;

    const dealerUpcard = dealerCards[0];
    const canDouble = currentHand.cards.length === 2;
    const canSplit =
      currentHand.cards.length === 2 && currentHand.cards[0].value === currentHand.cards[1].value;

    haptics.impactLight();

    // Real-time Coach Audit!
    const feedback = evaluatePlayerAction(
      action,
      currentHand.cards,
      dealerUpcard,
      runningCount,
      trueCount,
      decksRemaining,
      canDouble,
      canSplit
    );

    // If it's a mistake or deviation, open Coach Modal!
    if (feedback.type !== 'correct') {
      setCoachFeedback(feedback);
    }

    let ptr = dealtCardCount;

    if (action === 'hit') {
      const drawnCard = shoe[ptr++];
      setDealtCardCount(ptr);
      setDealtCardsHistory((prev) => [...prev, drawnCard]);
      sounds.playCardFlip();

      const newCards = [...currentHand.cards, drawnCard];
      const { total, isBusted } = calculateHandTotal(newCards);

      const updatedHands = [...playerHands];
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: newCards,
        isBusted,
        status: isBusted ? 'busted' : total === 21 ? 'stood' : 'playing',
      };
      setPlayerHands(updatedHands);

      if (isBusted || total === 21) {
        advanceHandOrDealer(updatedHands, activeHandIndex);
      }
    } else if (action === 'stand') {
      sounds.playCardFlip();
      const updatedHands = [...playerHands];
      updatedHands[activeHandIndex] = {
        ...currentHand,
        status: 'stood',
      };
      setPlayerHands(updatedHands);
      advanceHandOrDealer(updatedHands, activeHandIndex);
    } else if (action === 'double' && canDouble) {
      sounds.playChip();
      const drawnCard = shoe[ptr++];
      setDealtCardCount(ptr);
      setDealtCardsHistory((prev) => [...prev, drawnCard]);
      sounds.playCardFlip();

      const newCards = [...currentHand.cards, drawnCard];
      const { isBusted } = calculateHandTotal(newCards);

      const updatedHands = [...playerHands];
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: newCards,
        bet: currentHand.bet * 2,
        isDoubled: true,
        isBusted,
        status: isBusted ? 'busted' : 'stood',
      };
      setPlayerHands(updatedHands);
      advanceHandOrDealer(updatedHands, activeHandIndex);
    } else if (action === 'split' && canSplit) {
      sounds.playChip();
      const cardA = currentHand.cards[0];
      const cardB = currentHand.cards[1];

      const draw1 = shoe[ptr++];
      const draw2 = shoe[ptr++];
      setDealtCardCount(ptr);
      setDealtCardsHistory((prev) => [...prev, draw1, draw2]);
      sounds.playCardFlip();

      const hand1: Hand = {
        id: `split-1`,
        cards: [cardA, draw1],
        bet: currentHand.bet,
        isDoubled: false,
        isSplit: true,
        isBusted: false,
        isBlackjack: false,
        isStood: false,
        isSurrendered: false,
        status: 'playing',
      };

      const hand2: Hand = {
        id: `split-2`,
        cards: [cardB, draw2],
        bet: currentHand.bet,
        isDoubled: false,
        isSplit: true,
        isBusted: false,
        isBlackjack: false,
        isStood: false,
        isSurrendered: false,
        status: 'playing',
      };

      setPlayerHands([hand1, hand2]);
    }
  };

  const advanceHandOrDealer = (hands: Hand[], currentIdx: number) => {
    if (currentIdx + 1 < hands.length) {
      setActiveHandIndex(currentIdx + 1);
    } else {
      handleDealerTurn(hands, dealerCards);
    }
  };

  // Dealer Turn & Game Settlement
  const handleDealerTurn = (hands: Hand[], initialDealerCards: Card[]) => {
    setGameStage('dealer');

    // Check if all player hands busted
    const allBusted = hands.every((h) => h.isBusted);

    let currentDealerCards = [...initialDealerCards];
    let ptr = dealtCardCount;

    if (!allBusted) {
      let dealerTotal = calculateHandTotal(currentDealerCards).total;
      const mustHitSoft17 = dealerRule === 'h17';

      while (
        dealerTotal < 17 ||
        (mustHitSoft17 && dealerTotal === 17 && calculateHandTotal(currentDealerCards).isSoft)
      ) {
        const drawn = shoe[ptr++];
        currentDealerCards.push(drawn);
        setDealtCardsHistory((prev) => [...prev, drawn]);
        dealerTotal = calculateHandTotal(currentDealerCards).total;
      }
      setDealtCardCount(ptr);
    }

    setDealerCards(currentDealerCards);

    // Settle bets
    const dealerResult = calculateHandTotal(currentDealerCards);
    let netRoundProfit = 0;
    let roundOutcomeText = '';

    hands.forEach((hand) => {
      const pResult = calculateHandTotal(hand.cards);

      if (hand.isBusted) {
        netRoundProfit -= hand.bet;
        roundOutcomeText = 'Dealer Wins (Bust)';
      } else if (pResult.isBlackjack && !dealerResult.isBlackjack) {
        const bjWin = Math.floor(hand.bet * 1.5);
        netRoundProfit += bjWin;
        roundOutcomeText = 'BLACKJACK! Pays 3:2';
      } else if (dealerResult.isBusted) {
        netRoundProfit += hand.bet;
        roundOutcomeText = 'Dealer Busts! You Win';
      } else if (pResult.total > dealerResult.total) {
        netRoundProfit += hand.bet;
        roundOutcomeText = 'You Win!';
      } else if (pResult.total < dealerResult.total) {
        netRoundProfit -= hand.bet;
        roundOutcomeText = 'Dealer Wins';
      } else {
        roundOutcomeText = 'Push (Tie)';
      }
    });

    setOutcomeMessage(roundOutcomeText);
    setGameStage('settled');

    const outcome = netRoundProfit > 0 ? 'won' : netRoundProfit < 0 ? 'lost' : 'push';
    recordLiveHandResult(outcome, netRoundProfit, true);

    if (netRoundProfit > 0) {
      sounds.playCorrect();
      haptics.notificationSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981'],
      });
    } else if (netRoundProfit < 0) {
      sounds.playError();
      haptics.notificationError();
    }
  };

  // Keyboard Hotkeys for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStage === 'betting' || gameStage === 'settled') {
          if (gameStage === 'settled') {
            setGameStage('betting');
          } else {
            startDeal();
          }
        }
      } else if (gameStage === 'playing') {
        if (key === 'h') {
          e.preventDefault();
          handlePlayerAction('hit');
        } else if (key === 's') {
          e.preventDefault();
          handlePlayerAction('stand');
        } else if (key === 'd') {
          e.preventDefault();
          handlePlayerAction('double');
        } else if (key === 'p') {
          e.preventDefault();
          handlePlayerAction('split');
        }
      } else if (gameStage === 'insurance') {
        if (key === 'i') {
          e.preventDefault();
          handleInsurance(true);
        } else if (key === 's' || key === 'd') {
          e.preventDefault();
          handleInsurance(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStage, startDeal, handlePlayerAction, handleInsurance]);

  const activeHand = playerHands[activeHandIndex];
  const isDealerHidden = gameStage === 'playing' || gameStage === 'insurance';

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-4 flex flex-col items-center select-none">
      {/* Table Status Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 font-mono text-xs shadow-xl">
        {/* Count Assist / Stealth Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-slate-400">RC:</span>
            <span
              className={`font-bold ${
                countVisibility === 'visible'
                  ? runningCount > 0
                    ? 'text-emerald-400'
                    : runningCount < 0
                    ? 'text-rose-400'
                    : 'text-slate-200'
                  : 'text-slate-600 blur-[2px]'
              }`}
            >
              {countVisibility === 'visible' ? (runningCount > 0 ? `+${runningCount}` : runningCount) : '??'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-semibold">TC:</span>
            <span
              className={`font-bold ${
                countVisibility === 'visible'
                  ? trueCount > 0
                    ? 'text-amber-400'
                    : trueCount < 0
                    ? 'text-rose-400'
                    : 'text-slate-200'
                  : 'text-slate-600 blur-[2px]'
              }`}
            >
              {countVisibility === 'visible' ? (trueCount > 0 ? `+${trueCount}` : trueCount) : '??'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{decksRemaining.toFixed(1)}d left</span>
          </div>
        </div>

        {/* Bet Spread Sizing Advisor */}
        <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-200 text-[11px] sm:text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            TC <strong className="text-amber-400">{trueCount > 0 ? `+${trueCount}` : trueCount}</strong>
            {' → '}Advised: <strong className="text-emerald-400">${recommendedBetAmount}</strong> ({recommendedBetUnits}u)
          </span>
        </div>

        {/* Bankroll */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-amber-300 font-bold">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>${stats.live.bankroll}</span>
        </div>
      </div>

      {/* Main Felt Blackjack Table */}
      <div className="w-full relative casino-felt-table rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[500px] border border-emerald-900/50 shadow-2xl overflow-hidden">
        {/* Table Felt Header & Rules */}
        <div className="text-center font-mono text-emerald-300/80 text-[10px] sm:text-xs tracking-widest uppercase border-b border-emerald-800/40 pb-2.5 w-full flex items-center justify-between">
          <span>BLACKJACK PAYS 3:2</span>
          <span>{dealerRule === 's17' ? 'STANDS SOFT 17' : 'HITS SOFT 17'}</span>
          <span>INSURANCE 2:1</span>
        </div>

        {/* Dealer Hand */}
        <div className="flex flex-col items-center my-2 sm:my-3">
          <div className="text-[11px] font-mono text-emerald-300/90 font-bold uppercase tracking-wider mb-2">
            Dealer {dealerCards.length > 0 && !isDealerHidden && `(${calculateHandTotal(dealerCards).total})`}
          </div>
          <div className="flex gap-2">
            {dealerCards.length > 0 ? (
              <>
                <CardView card={dealerCards[0]} size="lg" />
                <CardView card={dealerCards[1]} faceDown={isDealerHidden} size="lg" />
                {dealerCards.slice(2).map((c, i) => (
                  <CardView key={i} card={c} size="lg" />
                ))}
              </>
            ) : (
              <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-2xl border-2 border-dashed border-emerald-700/50 flex items-center justify-center text-xs text-emerald-500 font-mono">
                Dealer Ready
              </div>
            )}
          </div>
        </div>

        {/* Outcome Notification Banner */}
        {outcomeMessage && (
          <div className="my-1.5 px-5 py-2 rounded-2xl bg-slate-950/95 border border-amber-500/60 text-amber-300 font-mono font-black text-xs sm:text-sm tracking-wide shadow-2xl animate-in zoom-in-95">
            {outcomeMessage}
          </div>
        )}

        {/* Player Hands */}
        <div className="flex flex-col items-center my-2 sm:my-3">
          <div className="flex gap-4 sm:gap-6">
            {playerHands.length > 0 ? (
              playerHands.map((hand, idx) => {
                const { total, isSoft, isBusted, isBlackjack } = calculateHandTotal(hand.cards);
                const isSelected = activeHandIndex === idx && gameStage === 'playing';

                return (
                  <div
                    key={hand.id}
                    className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl transition-all ${
                      isSelected ? 'ring-2 ring-amber-400 bg-emerald-950/70 shadow-lg' : 'bg-slate-950/50'
                    }`}
                  >
                    <div className="flex gap-1.5 sm:gap-2 mb-2">
                      {hand.cards.map((c, cIdx) => (
                        <CardView key={cIdx} card={c} size="lg" />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-white font-bold">
                        {isBlackjack ? 'Blackjack 21' : isBusted ? 'Bust!' : `${isSoft ? 'Soft ' : ''}${total}`}
                      </span>
                      <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        ${hand.bet}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-2xl border-2 border-dashed border-emerald-700/50 flex items-center justify-center text-xs text-emerald-500 font-mono">
                Player Hand
              </div>
            )}
          </div>
        </div>

        {/* Mobile Ergonomic Action Dock */}
        <div className="w-full max-w-xl mt-3 z-10">
          {gameStage === 'betting' && (
            <div className="flex flex-col items-center gap-2.5">
              {/* Chip selector */}
              <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs overflow-x-auto py-1">
                {[10, 25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setCurrentBet(amt);
                      sounds.playChip();
                      haptics.impactLight();
                    }}
                    className={`px-3 py-2 rounded-xl font-bold border transition-all active:scale-95 ${
                      currentBet === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105'
                        : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                onClick={startDeal}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:brightness-110 active:scale-98 text-white font-black text-base shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Deal Hand [Space]</span>
              </button>
            </div>
          )}

          {gameStage === 'insurance' && (
            <div className="p-4 bg-slate-950/95 border border-amber-500/60 rounded-2xl flex flex-col items-center gap-3 text-center">
              <div className="text-sm font-bold text-amber-400">
                Dealer shows Ace — Insurance Offered!
              </div>
              <p className="text-xs text-slate-400 max-w-sm font-sans">
                Illustrious 18 Rule #1: Does the current True Count warrant taking insurance?
              </p>
              <div className="flex gap-2.5 w-full">
                <button
                  onClick={() => handleInsurance(true)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold rounded-xl text-sm shadow-md"
                >
                  Take Insurance [I]
                </button>
                <button
                  onClick={() => handleInsurance(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold rounded-xl text-sm shadow-md"
                >
                  Decline [S]
                </button>
              </div>
            </div>
          )}

          {gameStage === 'playing' && (
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              <button
                onClick={() => handlePlayerAction('hit')}
                className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-lg transition-all flex flex-col items-center justify-center"
              >
                <span>HIT</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[H]</span>
              </button>

              <button
                onClick={() => handlePlayerAction('stand')}
                className="py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-lg transition-all flex flex-col items-center justify-center"
              >
                <span>STAND</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[S]</span>
              </button>

              <button
                onClick={() => handlePlayerAction('double')}
                disabled={activeHand?.cards.length !== 2}
                className="py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg transition-all flex flex-col items-center justify-center"
              >
                <span>DOUBLE</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[D]</span>
              </button>

              <button
                onClick={() => handlePlayerAction('split')}
                disabled={
                  activeHand?.cards.length !== 2 || activeHand?.cards[0].value !== activeHand?.cards[1].value
                }
                className="py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-lg transition-all flex flex-col items-center justify-center"
              >
                <span>SPLIT</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[P]</span>
              </button>
            </div>
          )}

          {gameStage === 'settled' && (
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setGameStage('betting');
                  setOutcomeMessage('');
                }}
                autoFocus
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Next Hand [Space]</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={resetShoe}
                title="Shuffle New Shoe"
                className="px-4 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Table Coach Explainer Footer */}
      <div className="w-full mt-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="text-[11px] sm:text-xs">
            <span className="font-bold text-slate-200">Real-Time Coach Active:</span>{' '}
            Evaluates decisions against basic strategy & Illustrious 18 at current TC.
          </div>
        </div>
        <button
          onClick={resetShoe}
          className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
        >
          Reshuffle
        </button>
      </div>
    </div>
  );
};
