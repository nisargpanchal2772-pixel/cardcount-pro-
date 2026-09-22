import { Card, CoachFeedback, PlayerAction, Rank } from './types';
import { calculateHandTotal } from './deck';
import { findApplicableDeviation } from './deviations';

export function getDealerUpcardValue(card: Card): string {
  if (card.rank === 'A') return 'A';
  if (['10', 'J', 'Q', 'K'].includes(card.rank)) return '10';
  return card.rank;
}

export function getBasicStrategyAction(cards: Card[], dealerUpcard: Card, canDouble: boolean = true, canSplit: boolean = true): PlayerAction {
  const upcard = getDealerUpcardValue(dealerUpcard);
  const { total, isSoft } = calculateHandTotal(cards);

  // 1. Check Pair Splitting (only on initial 2 cards)
  if (canSplit && cards.length === 2 && cards[0].value === cards[1].value) {
    const r1 = cards[0].rank;
    const isPairOf10s = ['10', 'J', 'Q', 'K'].includes(r1);

    if (r1 === 'A') return 'split';
    if (r1 === '8') return 'split';
    if (isPairOf10s) return 'stand';
    if (r1 === '9') {
      if (['7', '10', 'A'].includes(upcard)) return 'stand';
      return 'split';
    }
    if (r1 === '7') {
      if (['2', '3', '4', '5', '6', '7'].includes(upcard)) return 'split';
      return 'hit';
    }
    if (r1 === '6') {
      if (['2', '3', '4', '5', '6'].includes(upcard)) return 'split';
      return 'hit';
    }
    if (r1 === '5') {
      // 5,5 is treated as Hard 10
      if (canDouble && ['2', '3', '4', '5', '6', '7', '8', '9'].includes(upcard)) return 'double';
      return 'hit';
    }
    if (r1 === '4') {
      if (['5', '6'].includes(upcard)) return 'split';
      return 'hit';
    }
    if (r1 === '3' || r1 === '2') {
      if (['2', '3', '4', '5', '6', '7'].includes(upcard)) return 'split';
      return 'hit';
    }
  }

  // 2. Soft Totals
  if (isSoft && cards.length >= 2) {
    if (total >= 20) return 'stand'; // A,9 or higher
    if (total === 19) {
      if (canDouble && cards.length === 2 && upcard === '6') return 'double';
      return 'stand';
    }
    if (total === 18) {
      if (canDouble && cards.length === 2 && ['2', '3', '4', '5', '6'].includes(upcard)) return 'double';
      if (['7', '8'].includes(upcard)) return 'stand';
      return 'hit';
    }
    if (total === 17) {
      if (canDouble && cards.length === 2 && ['3', '4', '5', '6'].includes(upcard)) return 'double';
      return 'hit';
    }
    if (total === 16 || total === 15) {
      if (canDouble && cards.length === 2 && ['4', '5', '6'].includes(upcard)) return 'double';
      return 'hit';
    }
    if (total === 14 || total === 13) {
      if (canDouble && cards.length === 2 && ['5', '6'].includes(upcard)) return 'double';
      return 'hit';
    }
  }

  // 3. Hard Totals
  if (total >= 17) return 'stand';
  if (total >= 13 && total <= 16) {
    if (['2', '3', '4', '5', '6'].includes(upcard)) return 'stand';
    return 'hit';
  }
  if (total === 12) {
    if (['4', '5', '6'].includes(upcard)) return 'stand';
    return 'hit';
  }
  if (total === 11) {
    if (canDouble && cards.length === 2) return 'double';
    return 'hit';
  }
  if (total === 10) {
    if (canDouble && cards.length === 2 && ['2', '3', '4', '5', '6', '7', '8', '9'].includes(upcard)) return 'double';
    return 'hit';
  }
  if (total === 9) {
    if (canDouble && cards.length === 2 && ['3', '4', '5', '6'].includes(upcard)) return 'double';
    return 'hit';
  }

  return 'hit'; // 8 or lower
}

export function evaluatePlayerAction(
  playerAction: PlayerAction,
  playerCards: Card[],
  dealerUpcard: Card,
  runningCount: number,
  trueCount: number,
  decksRemaining: number,
  canDouble: boolean = true,
  canSplit: boolean = true
): CoachFeedback {
  const basicAction = getBasicStrategyAction(playerCards, dealerUpcard, canDouble, canSplit);
  const deviationRule = findApplicableDeviation(playerCards, dealerUpcard, trueCount, false);

  let optimalAction = basicAction;
  let isDeviationTriggered = false;

  if (deviationRule) {
    const conditionMet =
      deviationRule.comparison === '>='
        ? trueCount >= deviationRule.triggerIndex
        : trueCount <= deviationRule.triggerIndex;

    if (conditionMet) {
      isDeviationTriggered = true;
      optimalAction = deviationRule.deviationAction;
    }
  }

  const { total } = calculateHandTotal(playerCards);
  const upcardRank = dealerUpcard.rank;

  // Case 1: Player took optimal action when deviation triggered
  if (isDeviationTriggered && playerAction === optimalAction) {
    return {
      type: 'deviation_correct',
      title: 'Masterful Deviation! (+EV Play)',
      actionTaken: playerAction.toUpperCase(),
      recommendedAction: optimalAction.toUpperCase(),
      runningCount,
      trueCount,
      decksRemaining,
      rule: deviationRule!,
      message: `You executed Illustrious 18 Rule #${deviationRule!.rankIndex} perfectly!`,
      mathematicalDetail: deviationRule!.explanation,
    };
  }

  // Case 2: Player followed basic action, but missed the deviation
  if (isDeviationTriggered && playerAction === basicAction && playerAction !== optimalAction) {
    return {
      type: 'deviation_error',
      title: 'Deviation Missed!',
      actionTaken: playerAction.toUpperCase(),
      recommendedAction: optimalAction.toUpperCase(),
      runningCount,
      trueCount,
      decksRemaining,
      rule: deviationRule!,
      message: `Basic strategy would be to ${basicAction.toUpperCase()}, but at True Count ${trueCount >= 0 ? `+${trueCount}` : trueCount} (trigger is ${deviationRule!.comparison} ${deviationRule!.triggerIndex}), you should ${optimalAction.toUpperCase()}.`,
      mathematicalDetail: `${deviationRule!.explanation} EV impact: ${deviationRule!.evImpact}`,
    };
  }

  // Case 3: Player made a correct basic strategy decision (no deviation or deviation not triggered)
  if (playerAction === optimalAction) {
    return {
      type: 'correct',
      title: 'Correct Decision',
      actionTaken: playerAction.toUpperCase(),
      recommendedAction: optimalAction.toUpperCase(),
      runningCount,
      trueCount,
      decksRemaining,
      message: `Optimal play on ${total} vs Dealer ${upcardRank} is to ${optimalAction.toUpperCase()}.`,
      mathematicalDetail: `True Count is ${trueCount >= 0 ? `+${trueCount}` : trueCount}. Basic Strategy holds.`,
    };
  }

  // Case 4: Player made a Basic Strategy error
  return {
    type: 'basic_error',
    title: 'Basic Strategy Error',
    actionTaken: playerAction.toUpperCase(),
    recommendedAction: optimalAction.toUpperCase(),
    runningCount,
    trueCount,
    decksRemaining,
    message: `Incorrect action. On ${total} vs Dealer ${upcardRank}, the optimal play is ${optimalAction.toUpperCase()}, not ${playerAction.toUpperCase()}.`,
    mathematicalDetail: `At True Count ${trueCount >= 0 ? `+${trueCount}` : trueCount}, this play results in an immediate loss in expected value. Review basic strategy for ${total} vs ${upcardRank}.`,
  };
}

export function evaluateInsuranceDecision(
  playerTookInsurance: boolean,
  runningCount: number,
  trueCount: number,
  decksRemaining: number
): CoachFeedback {
  const shouldTakeInsurance = trueCount >= 3;
  const recommended = shouldTakeInsurance ? 'TAKE INSURANCE' : 'DECLINE INSURANCE';
  const taken = playerTookInsurance ? 'TAKE INSURANCE' : 'DECLINE INSURANCE';

  if (playerTookInsurance === shouldTakeInsurance) {
    return {
      type: shouldTakeInsurance ? 'deviation_correct' : 'correct',
      title: shouldTakeInsurance ? 'Perfect Insurance Call!' : 'Correct Insurance Decline',
      actionTaken: taken,
      recommendedAction: recommended,
      runningCount,
      trueCount,
      decksRemaining,
      message: shouldTakeInsurance
        ? 'At True Count >= +3, taking insurance yields positive expectation (+0.50% EV).'
        : 'Basic strategy: Never take insurance when True Count is under +3.',
      mathematicalDetail: `With ${decksRemaining.toFixed(1)} decks remaining and RC ${runningCount} (TC ${trueCount >= 0 ? `+${trueCount}` : trueCount}), 10-density is ${shouldTakeInsurance ? 'above' : 'below'} the 33.33% break-even threshold for 2:1 insurance.`,
    };
  }

  return {
    type: 'deviation_error',
    title: shouldTakeInsurance ? 'Missed Insurance Bet!' : 'Costly Insurance Mistake!',
    actionTaken: taken,
    recommendedAction: recommended,
    runningCount,
    trueCount,
    decksRemaining,
    message: shouldTakeInsurance
      ? `True Count is +${trueCount}! The shoe is heavily saturated with 10s (>33.3%). You should have taken insurance.`
      : `True Count is only ${trueCount}. Taking insurance here has a heavy -7.4% house edge. Decline!`,
    mathematicalDetail: 'Insurance pays 2 to 1. It is mathematically profitable ONLY when True Count is +3 or higher in Hi-Lo.',
  };
}
