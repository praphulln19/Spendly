import { createExpense } from '../services/expenseService';
import { readScoped, writeScoped } from './userStorage';
import type { Expense, NewExpense } from '../types/expense';

/*
 * Expenses get logged standing at a counter on a bad connection -- that is the
 * primary use case, not an edge case. Writes are therefore applied to local
 * state immediately and parked in this queue until the server confirms them.
 *
 * Every queued write carries the id it was created with, so replaying it after a
 * dropped response hits the same primary key instead of creating a duplicate.
 */

const QUEUE_KEY = 'pending-expenses';

export interface QueuedExpense extends NewExpense {
  id: string;
  queued_at: string;
}

export function readQueue(userId: string | null): QueuedExpense[] {
  return readScoped<QueuedExpense[]>(userId, QUEUE_KEY, []);
}

function writeQueue(userId: string | null, queue: QueuedExpense[]): void {
  writeScoped(userId, QUEUE_KEY, queue);
}

export function enqueue(userId: string | null, expense: QueuedExpense): void {
  const queue = readQueue(userId);
  if (queue.some((item) => item.id === expense.id)) return;
  writeQueue(userId, [...queue, expense]);
}

export function dequeue(userId: string | null, id: string): void {
  writeQueue(
    userId,
    readQueue(userId).filter((item) => item.id !== id)
  );
}

/*
 * Which failures mean the row itself is bad.
 *
 * Membership here has to be earned: anything unrecognised is treated as
 * transient and stays queued. Dropping a row throws away money someone actually
 * spent, while keeping a doomed one costs a retry, and that asymmetry decides
 * the default.
 *
 * The test used to be "the error carries a string code", which swept up
 * PGRST301 -- what PostgREST answers with when the JWT has expired. Coming back
 * online after a token lapsed therefore read as "the server rejected this row"
 * and deleted everything logged while offline, which is the one thing this queue
 * exists to prevent.
 *
 * 23502 (not_null_violation) is deliberately absent. `user_id` defaults to
 * auth.uid(), so a session that has quietly gone anonymous writes a null into it
 * and trips that constraint. It means the client is signed out, not that the
 * expense is malformed.
 */
const PERMANENT_ERROR_CODES = new Set([
  '22003', // numeric_value_out_of_range -- an amount beyond numeric(12,2)
  '22007', // invalid_datetime_format
  '22P02', // invalid_text_representation -- a malformed date or uuid
  '23503', // foreign_key_violation -- the owning auth user is gone
  '23505', // unique_violation -- the row is already there, which is success
  '23514', // check_violation -- unknown category, non-positive amount, overlong text
  '23P01', // exclusion_violation
]);

/** A PostgrestError carries a Postgres error code; a dropped connection does not. */
function errorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null;
  const { code } = error as { code?: unknown };
  return typeof code === 'string' ? code : null;
}

function isPermanentFailure(error: unknown): boolean {
  const code = errorCode(error);
  return code !== null && PERMANENT_ERROR_CODES.has(code);
}

export interface FlushResult {
  synced: Expense[];
  /** Ids dropped because the server rejected the row itself */
  rejected: string[];
  /** Still queued because the network was unavailable */
  remaining: number;
}

/**
 * Replay queued writes oldest-first.
 *
 * A write that got no answer at all stops the run: the connection is down and
 * everything behind it would fail the same way, so there is nothing to gain by
 * asking. A write the server did answer, but refused for a reason replaying
 * cannot fix, is stepped over rather than stopped on -- otherwise a single
 * undeliverable row would hold every later expense hostage forever. It stays
 * queued, still shows as unsynced, and is tried again on the next flush.
 *
 * Rows are independent inserts under client-generated ids, so stepping over one
 * costs nothing but the order they land in.
 */
export async function flushQueue(userId: string | null): Promise<FlushResult> {
  const queue = readQueue(userId);
  const synced: Expense[] = [];
  const rejected: string[] = [];

  for (const item of queue) {
    const { queued_at: _queuedAt, ...payload } = item;
    try {
      const saved = await createExpense(payload);
      synced.push(saved);
      dequeue(userId, item.id);
    } catch (cause) {
      if (isPermanentFailure(cause)) {
        rejected.push(item.id);
        dequeue(userId, item.id);
        continue;
      }
      if (errorCode(cause) === null) break; // Offline: nothing behind this will land either.
      // Answered, but not with something a replay can clear. Leave it queued.
    }
  }

  return { synced, rejected, remaining: readQueue(userId).length };
}
