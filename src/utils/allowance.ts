import type { Expense } from '../types/expense';
import type { BudgetPeriod, NewBudgetPeriod } from '../types/budget';
import { formatMoney } from './format';

/* -------------------------------------------------------------------------- */
/* Date helpers                                                                */
/* -------------------------------------------------------------------------- */
/*
 * Dates are handled as YYYY-MM-DD strings throughout. `new Date('2026-08-15')`
 * parses as UTC midnight, which lands on the previous day for anyone west of
 * UTC -- so it is never used here. Ordering uses lexicographic string compare
 * (valid for zero-padded ISO dates) and arithmetic goes through local midnight.
 */

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(iso: string, count: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + count);
  return toISODate(date);
}

export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const today = todayISO(now);
  if (iso === today) return 'Today';
  if (iso === addDays(today, -1)) return 'Yesterday';
  if (iso === addDays(today, 1)) return 'Tomorrow';
  return parseISODate(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: parseISODate(iso).getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

export function formatPeriodLabel(period: Pick<BudgetPeriod, 'start_date' | 'end_date'>): string {
  const start = parseISODate(period.start_date);
  const end = parseISODate(period.end_date);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  });
  const endLabel = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

/* -------------------------------------------------------------------------- */
/* The allowance engine                                                        */
/* -------------------------------------------------------------------------- */

export type AllowancePhase = 'upcoming' | 'active' | 'ended';

export type AllowanceStatus =
  | 'on-track'
  | 'caution'
  | 'over-today'
  | 'over-period'
  | 'upcoming'
  | 'ended';

export interface Allowance {
  period: BudgetPeriod;
  today: string;
  phase: AllowancePhase;
  status: AllowanceStatus;

  amount: number;
  stashed: number;
  /** Amount actually available to spend down (amount minus the piggy bank) */
  spendable: number;

  spentToday: number;
  spentBeforeToday: number;
  spentTotal: number;
  remaining: number;

  daysTotal: number;
  /** Days left including today */
  daysRemaining: number;
  /** 1-based position of today within the period; 0 before it starts */
  dayIndex: number;

  /** What today is worth, fixed at the start of the day */
  todayBudget: number;
  /** todayBudget minus what has already gone out today; negative means over */
  todayLeft: number;

  averagePerDay: number;
  /** What is projected to be left at period end if the current pace holds */
  projectedEndBalance: number;
}

const sumAmounts = (expenses: Expense[]) => expenses.reduce((total, exp) => total + exp.amount, 0);

/** Expenses falling inside a period's window. */
export function expensesInPeriod(
  expenses: Expense[],
  period: Pick<BudgetPeriod, 'start_date' | 'end_date'>
): Expense[] {
  return expenses.filter((exp) => {
    const day = exp.date.slice(0, 10);
    return day >= period.start_date && day <= period.end_date;
  });
}

export function expensesOnDay(expenses: Expense[], day: string): Expense[] {
  return expenses.filter((exp) => exp.date.slice(0, 10) === day);
}

/**
 * The whole product in one function.
 *
 *   todayBudget = (spendable - spentBeforeToday) / daysRemainingIncludingToday
 *   todayLeft   = todayBudget - spentToday
 *
 * Because todayBudget is recomputed from history every day, underspending today
 * raises tomorrow's number on its own and overspending lowers it -- no stored
 * daily snapshot, no scheduled job, nothing to fall out of sync. Everything here
 * is derived from the expense rows plus the period itself.
 */
export function computeAllowance(
  period: BudgetPeriod,
  expenses: Expense[],
  now: Date = new Date()
): Allowance {
  const today = todayISO(now);
  const { start_date: start, end_date: end } = period;

  const phase: AllowancePhase = today < start ? 'upcoming' : today > end ? 'ended' : 'active';

  const withinPeriod = expensesInPeriod(expenses, period);
  const spentBeforeToday = sumAmounts(withinPeriod.filter((exp) => exp.date.slice(0, 10) < today));
  const spentToday = sumAmounts(withinPeriod.filter((exp) => exp.date.slice(0, 10) === today));
  const spentTotal = spentBeforeToday + spentToday;

  const spendable = Math.max(0, period.amount - period.stashed);
  const remaining = spendable - spentTotal;

  const daysTotal = daysBetween(start, end) + 1;
  const daysRemaining =
    phase === 'ended' ? 0 : phase === 'upcoming' ? daysTotal : daysBetween(today, end) + 1;
  const dayIndex = phase === 'upcoming' ? 0 : phase === 'ended' ? daysTotal : daysBetween(start, today) + 1;

  // Today's share is carved out of what was left when the day began, so money
  // already spent today does not shrink today's own budget.
  const remainingAtDayStart = spendable - spentBeforeToday;
  const todayBudget = daysRemaining > 0 ? Math.max(0, remainingAtDayStart / daysRemaining) : 0;
  const todayLeft = todayBudget - spentToday;

  const daysElapsed = phase === 'upcoming' ? 0 : Math.min(dayIndex, daysTotal);
  const averagePerDay = daysElapsed > 0 ? spentTotal / daysElapsed : 0;
  const daysAhead = phase === 'active' ? Math.max(0, daysRemaining - 1) : 0;
  const projectedEndBalance = remaining - averagePerDay * daysAhead;

  let status: AllowanceStatus;
  if (phase === 'upcoming') status = 'upcoming';
  else if (phase === 'ended') status = 'ended';
  else if (remaining < 0) status = 'over-period';
  else if (todayLeft < 0) status = 'over-today';
  else if (todayBudget > 0 && todayLeft < todayBudget * 0.2) status = 'caution';
  else status = 'on-track';

  return {
    period,
    today,
    phase,
    status,
    amount: period.amount,
    stashed: period.stashed,
    spendable,
    spentToday,
    spentBeforeToday,
    spentTotal,
    remaining,
    daysTotal,
    daysRemaining,
    dayIndex,
    todayBudget,
    todayLeft,
    averagePerDay,
    projectedEndBalance,
  };
}

export interface DayCell {
  date: string;
  /** What this day was worth when it began */
  budget: number;
  spent: number;
  /** spent / budget, uncapped so overspending is visible */
  ratio: number;
  state: 'past' | 'today' | 'future';
}

/**
 * Replay the allowance day by day across the whole period.
 *
 * This is what makes the rollover legible instead of magic: each past day shows
 * how much of its own allowance it consumed, so a run of heavy days visibly
 * explains why today's number came out small. Uses the same recurrence as
 * `computeAllowance`, so the final cell always agrees with the hero figure.
 */
export function buildDayStrip(
  period: BudgetPeriod,
  expenses: Expense[],
  now: Date = new Date()
): DayCell[] {
  const today = todayISO(now);
  const spendable = Math.max(0, period.amount - period.stashed);
  const daysTotal = daysBetween(period.start_date, period.end_date) + 1;

  const spentByDay = new Map<string, number>();
  for (const exp of expensesInPeriod(expenses, period)) {
    const day = exp.date.slice(0, 10);
    spentByDay.set(day, (spentByDay.get(day) ?? 0) + exp.amount);
  }

  const cells: DayCell[] = [];
  let spentBefore = 0;

  for (let index = 0; index < daysTotal; index += 1) {
    const date = addDays(period.start_date, index);
    const daysRemaining = daysTotal - index;
    const budget = Math.max(0, (spendable - spentBefore) / daysRemaining);
    const spent = spentByDay.get(date) ?? 0;

    cells.push({
      date,
      budget,
      spent,
      ratio: budget > 0 ? spent / budget : spent > 0 ? 1 : 0,
      state: date === today ? 'today' : date < today ? 'past' : 'future',
    });

    spentBefore += spent;
  }

  return cells;
}

/**
 * Express an amount as days of allowance -- "that dinner was 1.4 days" reads far
 * more concretely than the rupee figure alone.
 */
export function inDaysOfAllowance(amount: number, todayBudget: number): number {
  if (todayBudget <= 0) return 0;
  return amount / todayBudget;
}

export function formatDaysOfAllowance(amount: number, todayBudget: number): string {
  const days = inDaysOfAllowance(amount, todayBudget);
  if (days <= 0) return '—';
  if (days < 0.1) return '<0.1 days';
  return `${days.toFixed(1)} ${days >= 0.95 && days < 1.05 ? 'day' : 'days'}`;
}

/* -------------------------------------------------------------------------- */
/* Coaching                                                                    */
/* -------------------------------------------------------------------------- */

export type BudgetTone = 'critical' | 'warning' | 'caution' | 'good' | 'great' | 'neutral';

export interface BudgetMessage {
  tone: BudgetTone;
  title: string;
  detail: string;
}

/** What today is worth tomorrow, if today's spending stops here. */
export function tomorrowBudget(allowance: Allowance): number {
  if (allowance.daysRemaining <= 1) return 0;
  return Math.max(0, (allowance.spendable - allowance.spentTotal) / (allowance.daysRemaining - 1));
}

/**
 * One plain-language read on where the budget stands.
 *
 * Ordered by severity so the most consequential thing is the only thing said --
 * a person mid-spend gets one sentence, not a dashboard. Warnings name the
 * remedy rather than just the problem, and going well is stated as plainly as
 * going badly, because a budget that only ever scolds gets deleted.
 */
export function buildBudgetMessage(allowance: Allowance, now: Date = new Date()): BudgetMessage {
  const {
    phase,
    todayLeft,
    todayBudget,
    remaining,
    spentToday,
    spentTotal,
    spendable,
    daysRemaining,
    daysTotal,
    dayIndex,
    averagePerDay,
  } = allowance;

  const nextDay = tomorrowBudget(allowance);

  if (phase === 'upcoming') {
    return {
      tone: 'neutral',
      title: 'This budget has not started yet',
      detail: `It runs for ${daysTotal} days at ${formatMoney(todayBudget)} a day.`,
    };
  }

  if (phase === 'ended') {
    return remaining >= 0
      ? {
          tone: 'great',
          title: `Finished with ${formatMoney(remaining)} to spare`,
          detail: `You spent ${formatMoney(spentTotal)} of ${formatMoney(spendable)}. Start the next budget to keep going.`,
        }
      : {
          tone: 'critical',
          title: `Ended ${formatMoney(Math.abs(remaining))} over`,
          detail: 'Worth setting the next one a little higher, or trimming where it went.',
        };
  }

  if (remaining < 0) {
    return {
      tone: 'critical',
      title: `${formatMoney(Math.abs(remaining))} past this budget`,
      detail:
        daysRemaining > 1
          ? `There are still ${daysRemaining} days to go. Anything more has to come from somewhere else.`
          : 'Today is the last day, so this is where it lands.',
    };
  }

  if (todayLeft < 0) {
    return {
      tone: 'warning',
      title: `${formatMoney(Math.abs(todayLeft))} over for today`,
      detail:
        nextDay > 0
          ? `Tomorrow drops to ${formatMoney(nextDay)} to absorb it. Nothing is lost if you ease off.`
          : 'This is the last day of the budget.',
    };
  }

  // At the current average, does the money run out before the days do?
  const daysOfMoneyLeft = averagePerDay > 0 ? remaining / averagePerDay : Infinity;
  if (daysOfMoneyLeft < daysRemaining - 0.5 && dayIndex >= 2) {
    const sustainable = daysRemaining > 0 ? remaining / daysRemaining : 0;
    return {
      tone: 'warning',
      title: `On pace to run out ${formatDayLabel(
        addDays(todayISO(now), Math.max(0, Math.floor(daysOfMoneyLeft))),
        now
      )}`,
      detail: `You are averaging ${formatMoney(averagePerDay)} a day. About ${formatMoney(
        sustainable
      )} a day gets you to the end.`,
    };
  }

  if (todayBudget > 0 && todayLeft < todayBudget * 0.2) {
    return {
      tone: 'caution',
      title: `Only ${formatMoney(todayLeft)} left today`,
      detail:
        nextDay > 0
          ? `Today resets to ${formatMoney(nextDay)} tomorrow.`
          : 'This is the last day of the budget.',
    };
  }

  // Under an even pace by a full day's worth or more.
  const expectedByNow = daysTotal > 0 ? (spendable / daysTotal) * dayIndex : 0;
  const ahead = expectedByNow - spentTotal;
  if (ahead >= todayBudget && dayIndex >= 2) {
    return {
      tone: 'great',
      title: `You are ${formatMoney(ahead)} ahead of pace`,
      detail: `That underspending is why today is worth ${formatMoney(
        todayBudget
      )}. Hold this and you finish with roughly ${formatMoney(Math.max(0, ahead))} spare.`,
    };
  }

  if (spentToday === 0) {
    return {
      tone: 'good',
      title: 'Nothing spent yet today',
      detail: `The whole ${formatMoney(todayBudget)} is yours, and skipping it lifts tomorrow.`,
    };
  }

  return {
    tone: 'good',
    title: 'On track',
    detail: `${formatMoney(remaining)} left for ${daysRemaining} ${
      daysRemaining === 1 ? 'day' : 'days'
    }, and today is still ${formatMoney(todayLeft)} clear.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Period construction                                                         */
/* -------------------------------------------------------------------------- */

export function periodForThisMonth(now: Date = new Date()): NewBudgetPeriod {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { amount: 0, start_date: toISODate(start), end_date: toISODate(end) };
}

/**
 * Today until the day before money next lands -- the window students actually
 * live in ("₹8,000 has to last until the 5th").
 */
export function periodUntilDayOfMonth(dayOfMonth: number, now: Date = new Date()): NewBudgetPeriod {
  const start = todayISO(now);
  let target = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (toISODate(target) <= start) {
    target = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }
  return { amount: 0, start_date: start, end_date: addDays(toISODate(target), -1) };
}

export function periodOfNextDays(days: number, now: Date = new Date()): NewBudgetPeriod {
  const start = todayISO(now);
  return { amount: 0, start_date: start, end_date: addDays(start, Math.max(1, days) - 1) };
}

/**
 * The follow-on period suggested when the current one lapses: same length, same
 * amount, starting the day after it ended.
 */
export function nextPeriodAfter(period: BudgetPeriod): NewBudgetPeriod {
  const length = daysBetween(period.start_date, period.end_date) + 1;
  const start = addDays(period.end_date, 1);
  return { amount: period.amount, start_date: start, end_date: addDays(start, length - 1) };
}

/** The period covering today, if any. */
export function findCurrentPeriod(periods: BudgetPeriod[], now: Date = new Date()): BudgetPeriod | null {
  const today = todayISO(now);
  return periods.find((p) => today >= p.start_date && today <= p.end_date) ?? null;
}

/** The most recent period that has already ended. */
export function findLastEndedPeriod(periods: BudgetPeriod[], now: Date = new Date()): BudgetPeriod | null {
  const today = todayISO(now);
  return (
    periods
      .filter((p) => p.end_date < today)
      .sort((a, b) => (a.end_date < b.end_date ? 1 : -1))[0] ?? null
  );
}
