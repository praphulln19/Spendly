import { describe, it, expect } from 'vitest';
import type { Expense } from '../types/expense';
import type { BudgetPeriod } from '../types/budget';
import {
  addDays,
  buildDayStrip,
  computeAllowance,
  daysBetween,
  findCurrentPeriod,
  findLastEndedPeriod,
  isAlertSilenced,
  nextPeriodAfter,
  parseISODate,
  periodOfNextDays,
  periodUntilDayOfMonth,
  toISODate,
  todayISO,
} from './allowance';

/*
 * The allowance engine decides every number a person sees, so these tests aim at
 * the arithmetic that would be silently wrong rather than at coverage: the
 * rollover recurrence, what counts as inside the window, and the invariant that
 * the day strip and the hero figure can never disagree.
 */

const period = (over: Partial<BudgetPeriod> = {}): BudgetPeriod => ({
  id: 'p1',
  user_id: 'u1',
  amount: 3000,
  start_date: '2026-03-01',
  end_date: '2026-03-10', // ten days inclusive
  stashed: 0,
  created_at: '2026-03-01T00:00:00.000Z',
  ...over,
});

let seq = 0;
const spend = (date: string, amount: number): Expense => ({
  id: `e${(seq += 1)}`,
  user_id: 'u1',
  date,
  category: 'Food',
  description: '',
  amount,
  type: 'Need',
  created_at: `${date}T12:00:00.000Z`,
});

/** Local midday on the given day, so no test result can hinge on a clock edge. */
const at = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

describe('date helpers', () => {
  it('reads an ISO date in local time, not UTC', () => {
    // `new Date('2026-03-01')` is UTC midnight, which is still Feb 28 for anyone
    // west of UTC. That off-by-one is the whole reason parseISODate exists.
    const parsed = parseISODate('2026-03-01');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(1);
  });

  it('round-trips through toISODate', () => {
    expect(toISODate(parseISODate('2026-03-09'))).toBe('2026-03-09');
    expect(todayISO(at('2026-12-31'))).toBe('2026-12-31');
  });

  it('counts whole days, signed', () => {
    expect(daysBetween('2026-03-01', '2026-03-10')).toBe(9);
    expect(daysBetween('2026-03-10', '2026-03-01')).toBe(-9);
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0);
  });

  it('stays exact across month, year and DST boundaries', () => {
    // A DST day is 23 or 25 hours long, so dividing elapsed ms by 86_400_000 has
    // to round rather than truncate. This invariant catches a regression to
    // Math.floor in any timezone that observes a transition; the dates below are
    // the 2026 US and EU switchovers plus a leap day.
    const spans = ['2026-02-27', '2026-03-07', '2026-03-28', '2026-10-31', '2026-12-30'];
    for (const from of spans) {
      for (let n = 0; n <= 40; n += 1) {
        expect(daysBetween(from, addDays(from, n))).toBe(n);
      }
    }
  });

  it('adds days across boundaries', () => {
    expect(addDays('2026-02-27', 2)).toBe('2026-03-01'); // 2026 is not a leap year
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('computeAllowance', () => {
  it('splits the amount evenly on day one', () => {
    const a = computeAllowance(period(), [], at('2026-03-01'));
    expect(a.phase).toBe('active');
    expect(a.daysTotal).toBe(10);
    expect(a.daysRemaining).toBe(10);
    expect(a.dayIndex).toBe(1);
    expect(a.todayBudget).toBeCloseTo(300);
    expect(a.todayLeft).toBeCloseTo(300);
  });

  it("does not let today's own spending shrink today's budget", () => {
    // The carve-out is taken from what was left when the day began, so spending
    // at lunchtime must not move the number the morning promised.
    const a = computeAllowance(period(), [spend('2026-03-01', 100)], at('2026-03-01'));
    expect(a.todayBudget).toBeCloseTo(300);
    expect(a.spentToday).toBe(100);
    expect(a.todayLeft).toBeCloseTo(200);
    expect(a.spentBeforeToday).toBe(0);
  });

  it('lifts tomorrow when today is underspent', () => {
    const a = computeAllowance(period(), [spend('2026-03-01', 100)], at('2026-03-02'));
    expect(a.daysRemaining).toBe(9);
    expect(a.todayBudget).toBeCloseTo(2900 / 9); // 322.22, up from 300
    expect(a.todayBudget).toBeGreaterThan(300);
  });

  it('lowers tomorrow when today is overspent', () => {
    const a = computeAllowance(period(), [spend('2026-03-01', 600)], at('2026-03-02'));
    expect(a.todayBudget).toBeCloseTo(2400 / 9); // 266.67, down from 300
    expect(a.todayBudget).toBeLessThan(300);
  });

  it('takes the stash out of the spendable pool', () => {
    const a = computeAllowance(period({ stashed: 500 }), [], at('2026-03-01'));
    expect(a.spendable).toBe(2500);
    expect(a.todayBudget).toBeCloseTo(250);
  });

  it('never reports a negative spendable pool', () => {
    const a = computeAllowance(period({ amount: 3000, stashed: 4000 }), [], at('2026-03-01'));
    expect(a.spendable).toBe(0);
    expect(a.todayBudget).toBe(0);
  });

  it('ignores expenses outside the window', () => {
    const a = computeAllowance(
      period(),
      [spend('2026-02-28', 999), spend('2026-03-05', 100), spend('2026-03-11', 999)],
      at('2026-03-05')
    );
    expect(a.spentTotal).toBe(100);
  });

  it('splits spending into before-today and today', () => {
    const a = computeAllowance(
      period(),
      [spend('2026-03-01', 100), spend('2026-03-02', 50), spend('2026-03-03', 25)],
      at('2026-03-03')
    );
    expect(a.spentBeforeToday).toBe(150);
    expect(a.spentToday).toBe(25);
    expect(a.spentTotal).toBe(175);
    expect(a.remaining).toBe(2825);
  });

  it('reports an upcoming period without consuming any of it', () => {
    const a = computeAllowance(period(), [], at('2026-02-25'));
    expect(a.phase).toBe('upcoming');
    expect(a.status).toBe('upcoming');
    expect(a.dayIndex).toBe(0);
    expect(a.daysRemaining).toBe(10);
    expect(a.averagePerDay).toBe(0);
  });

  it('closes out an ended period', () => {
    const a = computeAllowance(period(), [spend('2026-03-04', 500)], at('2026-03-15'));
    expect(a.phase).toBe('ended');
    expect(a.status).toBe('ended');
    expect(a.daysRemaining).toBe(0);
    expect(a.todayBudget).toBe(0);
    expect(a.dayIndex).toBe(10);
    expect(a.remaining).toBe(2500);
  });

  describe('status thresholds', () => {
    const statusAfter = (todaySpend: number) =>
      computeAllowance(period(), [spend('2026-03-01', todaySpend)], at('2026-03-01')).status;

    it('is on-track with room to spare', () => {
      expect(statusAfter(100)).toBe('on-track'); // 200 left of 300
    });

    it('cautions inside the last fifth of the day budget', () => {
      expect(statusAfter(250)).toBe('caution'); // 50 left, under the 60 threshold
    });

    it('flags going over for the day', () => {
      expect(statusAfter(350)).toBe('over-today');
    });

    it('escalates to over-period once the whole pool is gone', () => {
      expect(statusAfter(3100)).toBe('over-period');
    });
  });
});

describe('buildDayStrip', () => {
  const expenses = [spend('2026-03-01', 500), spend('2026-03-02', 100), spend('2026-03-03', 50)];

  it('covers exactly the period, one cell per day', () => {
    const cells = buildDayStrip(period(), [], at('2026-03-01'));
    expect(cells).toHaveLength(10);
    expect(cells[0].date).toBe('2026-03-01');
    expect(cells[9].date).toBe('2026-03-10');
  });

  it("agrees with the hero figure on today's budget", () => {
    // The strip is the same recurrence replayed, so a divergence here would mean
    // the page contradicts itself. Checked on every day of the period.
    for (let i = 0; i < 10; i += 1) {
      const now = at(addDays('2026-03-01', i));
      const cell = buildDayStrip(period(), expenses, now).find((c) => c.state === 'today');
      const hero = computeAllowance(period(), expenses, now);
      expect(cell).toBeDefined();
      expect(cell!.budget).toBeCloseTo(hero.todayBudget);
      expect(cell!.spent).toBeCloseTo(hero.spentToday);
    }
  });

  it('marks past, today and future', () => {
    const cells = buildDayStrip(period(), [], at('2026-03-03'));
    expect(cells[0].state).toBe('past');
    expect(cells[2].state).toBe('today');
    expect(cells[3].state).toBe('future');
  });

  it('leaves the ratio uncapped so an overspent day still reads as one', () => {
    const cells = buildDayStrip(period(), [spend('2026-03-01', 600)], at('2026-03-01'));
    expect(cells[0].budget).toBeCloseTo(300);
    expect(cells[0].ratio).toBeCloseTo(2); // 600 of 300, not clamped to 1
  });

  it('shows a heavy first day shrinking the days that follow', () => {
    const cells = buildDayStrip(period(), [spend('2026-03-01', 1200)], at('2026-03-01'));
    expect(cells[0].budget).toBeCloseTo(300);
    expect(cells[1].budget).toBeCloseTo(1800 / 9); // 200
    expect(cells[1].budget).toBeLessThan(cells[0].budget);
  });
});

describe('period construction', () => {
  it('runs from today to the day before money next lands', () => {
    const p = periodUntilDayOfMonth(5, at('2026-03-20'));
    expect(p.start_date).toBe('2026-03-20');
    expect(p.end_date).toBe('2026-04-04'); // the 5th belongs to the next period
  });

  it('uses this month when the target day is still ahead', () => {
    const p = periodUntilDayOfMonth(25, at('2026-03-20'));
    expect(p.end_date).toBe('2026-03-24');
  });

  it('rolls to next month when the target day is today or past', () => {
    expect(periodUntilDayOfMonth(20, at('2026-03-20')).end_date).toBe('2026-04-19');
  });

  it('counts a fixed run of days inclusively', () => {
    const p = periodOfNextDays(30, at('2026-03-01'));
    expect(p.start_date).toBe('2026-03-01');
    expect(daysBetween(p.start_date, p.end_date) + 1).toBe(30);
  });

  it('follows on with the same length and amount', () => {
    const next = nextPeriodAfter(period());
    expect(next.start_date).toBe('2026-03-11');
    expect(next.end_date).toBe('2026-03-20');
    expect(next.amount).toBe(3000);
  });
});

describe('period lookup', () => {
  const march = period();
  const april = period({ id: 'p2', start_date: '2026-04-01', end_date: '2026-04-30' });

  it('finds the period covering today, inclusive of both ends', () => {
    expect(findCurrentPeriod([march, april], at('2026-03-10'))?.id).toBe('p1');
    expect(findCurrentPeriod([march, april], at('2026-04-01'))?.id).toBe('p2');
    expect(findCurrentPeriod([march, april], at('2026-03-15'))).toBeNull();
  });

  it('falls back to the most recently ended period', () => {
    expect(findLastEndedPeriod([march, april], at('2026-05-01'))?.id).toBe('p2');
    expect(findLastEndedPeriod([march, april], at('2026-03-15'))?.id).toBe('p1');
    expect(findLastEndedPeriod([march, april], at('2026-01-01'))).toBeNull();
  });
});

describe('isAlertSilenced', () => {
  it('stays quiet for the rest of the day once waved away', () => {
    expect(isAlertSilenced({ date: '2026-03-01', tone: 'caution' }, 'caution', '2026-03-01')).toBe(true);
  });

  it('speaks again on a new day', () => {
    expect(isAlertSilenced({ date: '2026-03-01', tone: 'caution' }, 'caution', '2026-03-02')).toBe(false);
  });

  it('breaks silence when the news gets worse', () => {
    // Waving away "caution" in the morning must not swallow "past this budget"
    // in the afternoon -- that is the one message that has to get through.
    const dismissal = { date: '2026-03-01', tone: 'caution' } as const;
    expect(isAlertSilenced(dismissal, 'critical', '2026-03-01')).toBe(false);
    expect(isAlertSilenced(dismissal, 'warning', '2026-03-01')).toBe(false);
    expect(isAlertSilenced(dismissal, 'good', '2026-03-01')).toBe(true);
  });

  it('says nothing is silenced without a dismissal', () => {
    expect(isAlertSilenced(null, 'critical', '2026-03-01')).toBe(false);
  });
});
