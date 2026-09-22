export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // 2-10, 10 for face cards, 11 for Ace initially
  hiloValue: -1 | 0 | 1;
}

export type RoundingMode = 'floor' | 'round' | 'truncate';

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

export interface Hand {
  id: string;
  cards: Card[];
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
  isStood: boolean;
  isSurrendered: boolean;
  status: 'playing' | 'stood' | 'busted' | 'blackjack' | 'won' | 'lost' | 'push';
}

export interface DeviationRule {
  id: string;
  name: string;
  playerHandDesc: string; // e.g. "16" or "10,10" or "12"
  playerHandType: 'hard' | 'soft' | 'pair' | 'insurance';
  playerTotal: number;
  dealerUpcard: Rank;
  basicAction: PlayerAction;
  deviationAction: PlayerAction;
  triggerIndex: number;
  comparison: '>=' | '<=';
  explanation: string;
  evImpact: string;
  rankIndex: number; // 1 to 18 (and 19-22 for Fab 4)
}

export interface CoachFeedback {
  type: 'correct' | 'deviation_correct' | 'basic_error' | 'deviation_error' | 'bet_error';
  title: string;
  actionTaken: PlayerAction | string;
  recommendedAction: PlayerAction | string;
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  message: string;
  mathematicalDetail: string;
  rule?: DeviationRule;
}

export interface DrillStats {
  cardsViewed: number;
  correctCounts: number;
  totalChecks: number;
  currentStreak: number;
  bestStreak: number;
  avgReactionTimeMs: number;
  reactionTimes: number[];
}

export interface BetSpreadRule {
  minTrueCount: number;
  recommendedUnits: number;
  kellyFraction: string;
  playerEdge: string;
}
