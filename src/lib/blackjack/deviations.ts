import { Card, DeviationRule, PlayerAction, Rank } from './types';

export const ILLUSTRIOUS_18: DeviationRule[] = [
  {
    id: 'ill-1',
    rankIndex: 1,
    name: 'Insurance',
    playerHandDesc: 'Any Hand',
    playerHandType: 'insurance',
    playerTotal: 0,
    dealerUpcard: 'A',
    basicAction: 'stand', // decline insurance
    deviationAction: 'insurance', // take insurance
    triggerIndex: 3,
    comparison: '>=',
    explanation:
      'Basic Strategy says NEVER take insurance (house edge is 7.4% on a fresh shoe). However, at TC >= +3, 10-density exceeds 33.3% (1 in 3 cards). Because insurance pays 2:1, taking insurance becomes a positive expectation (+EV) bet.',
    evImpact: '+0.50% EV overall gain (by far the most valuable index)',
  },
  {
    id: 'ill-2',
    rankIndex: 2,
    name: '16 vs 10',
    playerHandDesc: 'Hard 16 (except 8,8)',
    playerHandType: 'hard',
    playerTotal: 16,
    dealerUpcard: '10',
    basicAction: 'hit',
    deviationAction: 'stand',
    triggerIndex: 0,
    comparison: '>=',
    explanation:
      'Basic Strategy says Hit 16 vs 10 because you are likely doomed anyway. But at TC >= 0, the deck has enough high cards that hitting will bust you ~62% of the time. The dealer also has an elevated risk of busting when their hole card is not a 10.',
    evImpact: '+0.28% EV gain',
  },
  {
    id: 'ill-3',
    rankIndex: 3,
    name: '15 vs 10',
    playerHandDesc: 'Hard 15',
    playerHandType: 'hard',
    playerTotal: 15,
    dealerUpcard: '10',
    basicAction: 'hit',
    deviationAction: 'stand',
    triggerIndex: 4,
    comparison: '>=',
    explanation:
      'At TC >= +4, the remaining shoe is severely saturated with 10-value cards and Aces. Hitting 15 busts on any card 7 through King. Standing preserves your hand while dealer bust odds rise.',
    evImpact: '+0.15% EV gain',
  },
  {
    id: 'ill-4',
    rankIndex: 4,
    name: 'Pair of 10s vs 5',
    playerHandDesc: '10, 10 (or Face)',
    playerHandType: 'pair',
    playerTotal: 20,
    dealerUpcard: '5',
    basicAction: 'stand',
    deviationAction: 'split',
    triggerIndex: 5,
    comparison: '>=',
    explanation:
      'Normally splitting 20 is forbidden in basic strategy. But at TC >= +5, dealer 5 will bust >44% of the time, and you are overwhelmingly likely to pull 10s/Aces on both split hands, generating two monster winning hands.',
    evImpact: '+0.13% EV gain (caution: draws extreme casino surveillance)',
  },
  {
    id: 'ill-5',
    rankIndex: 5,
    name: 'Pair of 10s vs 6',
    playerHandDesc: '10, 10 (or Face)',
    playerHandType: 'pair',
    playerTotal: 20,
    dealerUpcard: '6',
    basicAction: 'stand',
    deviationAction: 'split',
    triggerIndex: 4,
    comparison: '>=',
    explanation:
      'Dealer 6 is the weakest possible dealer upcard with the highest bust rate (~42%). At TC >= +4, splitting 20 into two hands yields greater expected value than sitting on a single 20.',
    evImpact: '+0.11% EV gain',
  },
  {
    id: 'ill-6',
    rankIndex: 6,
    name: '10 vs 10',
    playerHandDesc: 'Hard 10',
    playerHandType: 'hard',
    playerTotal: 10,
    dealerUpcard: '10',
    basicAction: 'hit',
    deviationAction: 'double',
    triggerIndex: 4,
    comparison: '>=',
    explanation:
      'Basic strategy hits 10 vs 10 to avoid double exposure against dealer strength. At TC >= +4, drawing a 10 gives you 20 with high frequency, making the double down mathematically superior to a hit.',
    evImpact: '+0.09% EV gain',
  },
  {
    id: 'ill-7',
    rankIndex: 7,
    name: '12 vs 3',
    playerHandDesc: 'Hard 12',
    playerHandType: 'hard',
    playerTotal: 12,
    dealerUpcard: '3',
    basicAction: 'hit',
    deviationAction: 'stand',
    triggerIndex: 2,
    comparison: '>=',
    explanation:
      'Basic strategy hits 12 vs 3 because dealer 3 busts only 37% of the time. But at TC >= +2, the surplus of 10-value cards makes hitting 12 too dangerous (you bust on 10, J, Q, K), so standing is optimal.',
    evImpact: '+0.08% EV gain',
  },
  {
    id: 'ill-8',
    rankIndex: 8,
    name: '12 vs 2',
    playerHandDesc: 'Hard 12',
    playerHandType: 'hard',
    playerTotal: 12,
    dealerUpcard: '2',
    basicAction: 'hit',
    deviationAction: 'stand',
    triggerIndex: 3,
    comparison: '>=',
    explanation:
      'Dealer 2 has a 35% bust probability. When TC reaches +3 or higher, player risk of busting a 12 on a hit exceeds the dealer chance of making a hand.',
    evImpact: '+0.07% EV gain',
  },
  {
    id: 'ill-9',
    rankIndex: 9,
    name: '11 vs A',
    playerHandDesc: 'Hard 11',
    playerHandType: 'hard',
    playerTotal: 11,
    dealerUpcard: 'A',
    basicAction: 'hit',
    deviationAction: 'double',
    triggerIndex: 1,
    comparison: '>=',
    explanation:
      'In S17 shoe games, 11 vs A is a basic hit. But with TC >= +1, your chance of receiving a 10 for 21 and the dealer busting outweighs dealer Ace strength, making the double highly profitable.',
    evImpact: '+0.07% EV gain',
  },
  {
    id: 'ill-10',
    rankIndex: 10,
    name: '9 vs 2',
    playerHandDesc: 'Hard 9',
    playerHandType: 'hard',
    playerTotal: 9,
    dealerUpcard: '2',
    basicAction: 'hit',
    deviationAction: 'double',
    triggerIndex: 1,
    comparison: '>=',
    explanation:
      'Basic strategy doubles 9 vs 3-6, but hits vs 2. At TC >= +1, doubling 9 vs 2 turns positive expectation due to increased frequency of 19s.',
    evImpact: '+0.05% EV gain',
  },
  {
    id: 'ill-11',
    rankIndex: 11,
    name: '10 vs A',
    playerHandDesc: 'Hard 10',
    playerHandType: 'hard',
    playerTotal: 10,
    dealerUpcard: 'A',
    basicAction: 'hit',
    deviationAction: 'double',
    triggerIndex: 4,
    comparison: '>=',
    explanation:
      'A fearless double down against dealer Ace. When TC is +4 or higher, the dealer will often draw small cards to bust or push while you secure 20.',
    evImpact: '+0.05% EV gain',
  },
  {
    id: 'ill-12',
    rankIndex: 12,
    name: '9 vs 7',
    playerHandDesc: 'Hard 9',
    playerHandType: 'hard',
    playerTotal: 9,
    dealerUpcard: '7',
    basicAction: 'hit',
    deviationAction: 'double',
    triggerIndex: 3,
    comparison: '>=',
    explanation:
      'Basic strategy hits 9 vs 7. At TC >= +3, doubling 9 gives a high probability of making 19 against dealer 17, doubling profit.',
    evImpact: '+0.04% EV gain',
  },
  {
    id: 'ill-13',
    rankIndex: 13,
    name: '16 vs 9',
    playerHandDesc: 'Hard 16 (except 8,8)',
    playerHandType: 'hard',
    playerTotal: 16,
    dealerUpcard: '9',
    basicAction: 'hit',
    deviationAction: 'stand',
    triggerIndex: 5,
    comparison: '>=',
    explanation:
      'At an extreme count of TC >= +5, hitting 16 almost certainly busts you. Even against a dealer 9, standing beats the certain bust of hitting.',
    evImpact: '+0.03% EV gain',
  },
  {
    id: 'ill-14',
    rankIndex: 14,
    name: '13 vs 2',
    playerHandDesc: 'Hard 13',
    playerHandType: 'hard',
    playerTotal: 13,
    dealerUpcard: '2',
    basicAction: 'stand',
    deviationAction: 'hit',
    triggerIndex: -1,
    comparison: '<=',
    explanation:
      'Basic strategy stands on 13 vs 2. But in negative counts (TC <= -1), the shoe is depleted of 10s and rich in small cards (2-6). You are much less likely to bust on 13, so you must hit.',
    evImpact: '+0.03% EV gain',
  },
  {
    id: 'ill-15',
    rankIndex: 15,
    name: '12 vs 4',
    playerHandDesc: 'Hard 12',
    playerHandType: 'hard',
    playerTotal: 12,
    dealerUpcard: '4',
    basicAction: 'stand',
    deviationAction: 'hit',
    triggerIndex: 0,
    comparison: '<=',
    explanation:
      'Basic strategy stands on 12 vs 4. If TC < 0, the deck has a surplus of low cards, so hitting 12 will safely improve your hand without busting.',
    evImpact: '+0.02% EV gain',
  },
  {
    id: 'ill-16',
    rankIndex: 16,
    name: '12 vs 5',
    playerHandDesc: 'Hard 12',
    playerHandType: 'hard',
    playerTotal: 12,
    dealerUpcard: '5',
    basicAction: 'stand',
    deviationAction: 'hit',
    triggerIndex: -2,
    comparison: '<=',
    explanation:
      'Basic strategy stands on 12 vs 5. At TC <= -2, small cards dominate the shoe, making hitting safe and superior to standing.',
    evImpact: '+0.02% EV gain',
  },
  {
    id: 'ill-17',
    rankIndex: 17,
    name: '12 vs 6',
    playerHandDesc: 'Hard 12',
    playerHandType: 'hard',
    playerTotal: 12,
    dealerUpcard: '6',
    basicAction: 'stand',
    deviationAction: 'hit',
    triggerIndex: -1,
    comparison: '<=',
    explanation:
      'Basic strategy stands on 12 vs 6. At TC <= -1, the scarcity of 10s means dealer 6 busts far less often, requiring player to hit and make a real total.',
    evImpact: '+0.02% EV gain',
  },
  {
    id: 'ill-18',
    rankIndex: 18,
    name: '13 vs 3',
    playerHandDesc: 'Hard 13',
    playerHandType: 'hard',
    playerTotal: 13,
    dealerUpcard: '3',
    basicAction: 'stand',
    deviationAction: 'hit',
    triggerIndex: -2,
    comparison: '<=',
    explanation:
      'Basic strategy stands on 13 vs 3. At TC <= -2, the deck is cold with low cards, rendering hitting safe and mathematically favored.',
    evImpact: '+0.02% EV gain',
  },
];

export const FAB_4_SURRENDERS: DeviationRule[] = [
  {
    id: 'fab-1',
    rankIndex: 19,
    name: 'Surrender 15 vs 10',
    playerHandDesc: 'Hard 15',
    playerHandType: 'hard',
    playerTotal: 15,
    dealerUpcard: '10',
    basicAction: 'hit',
    deviationAction: 'surrender',
    triggerIndex: 0,
    comparison: '>=',
    explanation: 'Surrendering 15 vs 10 at TC >= 0 saves half your bet when odds of winning on hit/stand drop below 25%.',
    evImpact: '+0.10% EV gain',
  },
  {
    id: 'fab-2',
    rankIndex: 20,
    name: 'Surrender 14 vs 10',
    playerHandDesc: 'Hard 14',
    playerHandType: 'hard',
    playerTotal: 14,
    dealerUpcard: '10',
    basicAction: 'hit',
    deviationAction: 'surrender',
    triggerIndex: 3,
    comparison: '>=',
    explanation: 'At TC >= +3, dealer 10 makes standing or hitting 14 a massive loser; surrendering locks in 50% salvage value.',
    evImpact: '+0.07% EV gain',
  },
  {
    id: 'fab-3',
    rankIndex: 21,
    name: 'Surrender 15 vs 9',
    playerHandDesc: 'Hard 15',
    playerHandType: 'hard',
    playerTotal: 15,
    dealerUpcard: '9',
    basicAction: 'hit',
    deviationAction: 'surrender',
    triggerIndex: 2,
    comparison: '>=',
    explanation: 'Surrender 15 vs 9 at TC >= +2 due to severe bust penalty when hitting against dealer solid pat card.',
    evImpact: '+0.05% EV gain',
  },
  {
    id: 'fab-4',
    rankIndex: 22,
    name: 'Surrender 15 vs A',
    playerHandDesc: 'Hard 15',
    playerHandType: 'hard',
    playerTotal: 15,
    dealerUpcard: 'A',
    basicAction: 'hit',
    deviationAction: 'surrender',
    triggerIndex: 1,
    comparison: '>=',
    explanation: 'Surrender 15 vs dealer Ace when TC >= +1, where dealer Ace converts to BJ or 20/21 frequently.',
    evImpact: '+0.04% EV gain',
  },
];

export const ALL_DEVIATIONS: DeviationRule[] = [...ILLUSTRIOUS_18, ...FAB_4_SURRENDERS];

export function findApplicableDeviation(
  cards: Card[],
  dealerUpcard: Card,
  trueCount: number,
  isInsuranceScenario: boolean = false
): DeviationRule | null {
  const upcardRank = dealerUpcard.rank === 'J' || dealerUpcard.rank === 'Q' || dealerUpcard.rank === 'K' ? '10' : dealerUpcard.rank;

  if (isInsuranceScenario) {
    if (upcardRank === 'A') {
      const insRule = ILLUSTRIOUS_18.find((r) => r.id === 'ill-1')!;
      return insRule;
    }
    return null;
  }

  // Check Pair of 10s
  const isPairOfTens =
    cards.length === 2 &&
    (cards[0].rank === '10' || ['J', 'Q', 'K'].includes(cards[0].rank)) &&
    (cards[1].rank === '10' || ['J', 'Q', 'K'].includes(cards[1].rank));

  if (isPairOfTens) {
    if (upcardRank === '5') {
      return ILLUSTRIOUS_18.find((r) => r.id === 'ill-4') || null;
    }
    if (upcardRank === '6') {
      return ILLUSTRIOUS_18.find((r) => r.id === 'ill-5') || null;
    }
  }

  // Check Soft hands vs Hard hands
  let aces = 0;
  let total = 0;
  cards.forEach((c) => {
    if (c.rank === 'A') aces++;
    total += c.value;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  const isSoft = aces > 0 && total <= 21;

  if (isSoft) {
    // Soft hands generally do not match Illustrious 18 (except 11 vs A is hard 11)
    return null;
  }

  // Hard hands:
  if (total === 16) {
    // Note: 8,8 is always split in basic strategy
    const is88 = cards.length === 2 && cards[0].rank === '8' && cards[1].rank === '8';
    if (!is88) {
      if (upcardRank === '10') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-2') || null;
      if (upcardRank === '9') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-13') || null;
    }
  }

  if (total === 15) {
    if (upcardRank === '10') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-3') || null;
  }

  if (total === 12) {
    if (upcardRank === '3') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-7') || null;
    if (upcardRank === '2') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-8') || null;
    if (upcardRank === '4') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-15') || null;
    if (upcardRank === '5') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-16') || null;
    if (upcardRank === '6') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-17') || null;
  }

  if (total === 13) {
    if (upcardRank === '2') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-14') || null;
    if (upcardRank === '3') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-18') || null;
  }

  if (total === 11) {
    if (upcardRank === 'A') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-9') || null;
  }

  if (total === 10) {
    if (upcardRank === '10') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-6') || null;
    if (upcardRank === 'A') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-11') || null;
  }

  if (total === 9) {
    if (upcardRank === '2') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-10') || null;
    if (upcardRank === '7') return ILLUSTRIOUS_18.find((r) => r.id === 'ill-12') || null;
  }

  return null;
}
