import { canTransition, isTerminal, nextExpected } from './dealStateMachine';

describe('canTransition', () => {
  test('allows each valid forward transition in the table', () => {
    expect(canTransition('request', 'offer_sent')).toBe(true);
    expect(canTransition('offer_sent', 'accepted')).toBe(true);
    expect(canTransition('offer_sent', 'declined')).toBe(true);
    expect(canTransition('accepted', 'countersigned')).toBe(true);
    expect(canTransition('countersigned', 'deposit_paid')).toBe(true);
    expect(canTransition('deposit_paid', 'completed')).toBe(true);
    expect(canTransition('completed', 'reviewed')).toBe(true);
  });

  test('rejects a transition not listed for the current status', () => {
    // request can only go to offer_sent/cancelled, not straight to accepted.
    expect(canTransition('request', 'accepted')).toBe(false);
  });

  test('rejects going backwards', () => {
    expect(canTransition('accepted', 'offer_sent')).toBe(false);
  });

  test('allows cancelling from any non-terminal status, even one not explicitly listed', () => {
    // TRANSITIONS['deposit_paid'] only lists 'completed', not 'cancelled' —
    // the special-case rule in canTransition allows it anyway, since
    // 'deposit_paid' isn't itself a terminal status.
    expect(canTransition('deposit_paid', 'cancelled')).toBe(true);
    expect(canTransition('completed', 'cancelled')).toBe(true);
  });

  test('rejects cancelling from an already-terminal status', () => {
    expect(canTransition('declined', 'cancelled')).toBe(false);
    expect(canTransition('cancelled', 'cancelled')).toBe(false);
    expect(canTransition('reviewed', 'cancelled')).toBe(false);
  });
});

describe('isTerminal', () => {
  test('true for declined, cancelled, and reviewed', () => {
    expect(isTerminal('declined')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('reviewed')).toBe(true);
  });

  test('false for every non-terminal status', () => {
    expect(isTerminal('request')).toBe(false);
    expect(isTerminal('offer_sent')).toBe(false);
    expect(isTerminal('accepted')).toBe(false);
    expect(isTerminal('countersigned')).toBe(false);
    expect(isTerminal('deposit_paid')).toBe(false);
    expect(isTerminal('completed')).toBe(false);
  });
});

describe('nextExpected', () => {
  test('returns the first listed transition for a non-terminal status', () => {
    expect(nextExpected('request')).toBe('offer_sent');
    expect(nextExpected('completed')).toBe('reviewed');
  });

  test('returns null for a terminal status', () => {
    expect(nextExpected('declined')).toBeNull();
    expect(nextExpected('cancelled')).toBeNull();
    expect(nextExpected('reviewed')).toBeNull();
  });
});
