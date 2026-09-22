import { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function getHiLoValue(rank: Rank): -1 | 0 | 1 {
  switch (rank) {
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      return 1;
    case '7':
    case '8':
    case '9':
      return 0;
    case '10':
    case 'J':
    case 'Q':
    case 'K':
    case 'A':
      return -1;
  }
}

export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function createSingleDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
        suit,
        rank,
        value: getCardValue(rank),
        hiloValue: getHiLoValue(rank),
      });
    }
  }
  return deck;
}

export function createShoe(deckCount: number = 6): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < deckCount; i++) {
    const singleDeck = createSingleDeck();
    shoe.push(...singleDeck);
  }
  return shuffleDeck(shoe);
}

export function shuffleDeck(cards: Card[]): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function calculateHandTotal(cards: Card[]): { total: number; isSoft: boolean; isBusted: boolean; isBlackjack: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else {
      total += card.value;
    }
  }

  let isSoft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  if (aces > 0 && total <= 21) {
    isSoft = true;
  }

  const isBusted = total > 21;
  const isBlackjack = cards.length === 2 && total === 21;

  return { total, isSoft, isBusted, isBlackjack };
}
