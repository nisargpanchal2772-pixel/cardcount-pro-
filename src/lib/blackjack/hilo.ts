import { Card, RoundingMode } from './types';

export function calculateRunningCount(cards: Card[]): number {
  return cards.reduce((acc, card) => acc + card.hiloValue, 0);
}

export function calculateDecksRemaining(totalCardsRemaining: number, roundToHalfDeck: boolean = true): number {
  const decks = totalCardsRemaining / 52;
  if (!roundToHalfDeck) {
    return Math.max(0.5, Math.round(decks * 10) / 10);
  }
  // Round to nearest 0.5 deck, minimum 0.5
  const rounded = Math.round(decks * 2) / 2;
  return Math.max(0.5, rounded);
}

export function calculateTrueCount(
  runningCount: number,
  decksRemaining: number,
  mode: RoundingMode = 'floor'
): number {
  if (decksRemaining <= 0) return runningCount;
  const rawTc = runningCount / decksRemaining;

  switch (mode) {
    case 'floor':
      // Casino standard flooring (e.g., +2.8 -> +2, -2.2 -> -3)
      return Math.floor(rawTc);
    case 'truncate':
      // Truncation towards zero (e.g., +2.8 -> +2, -2.8 -> -2)
      return Math.trunc(rawTc);
    case 'round':
    default:
      // Standard half-round
      return Math.round(rawTc);
  }
}

export interface CancellationPair {
  cardIndex1: number;
  cardIndex2: number;
  card1: Card;
  card2: Card;
}

export function findCancellationPairs(cards: Card[]): {
  pairs: CancellationPair[];
  neutralCards: { index: number; card: Card }[];
  unpairedPositives: { index: number; card: Card }[];
  unpairedNegatives: { index: number; card: Card }[];
  netCount: number;
} {
  const positives: { index: number; card: Card }[] = [];
  const negatives: { index: number; card: Card }[] = [];
  const neutrals: { index: number; card: Card }[] = [];

  cards.forEach((card, index) => {
    if (card.hiloValue === 1) positives.push({ index, card });
    else if (card.hiloValue === -1) negatives.push({ index, card });
    else neutrals.push({ index, card });
  });

  const pairs: CancellationPair[] = [];
  const pairCount = Math.min(positives.length, negatives.length);

  for (let i = 0; i < pairCount; i++) {
    const pos = positives[i];
    const neg = negatives[i];
    pairs.push({
      cardIndex1: pos.index,
      cardIndex2: neg.index,
      card1: pos.card,
      card2: neg.card,
    });
  }

  const unpairedPositives = positives.slice(pairCount);
  const unpairedNegatives = negatives.slice(pairCount);
  const netCount = unpairedPositives.length - unpairedNegatives.length;

  return {
    pairs,
    neutralCards: neutrals,
    unpairedPositives,
    unpairedNegatives,
    netCount,
  };
}
