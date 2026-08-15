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

/**
 * A PostgrestError carries a Postgres error code; a dropped connection does not.
 * Rows rejected on their merits are dropped from the queue so one bad record
 * cannot wedge every write behind it, while transient failures stay queued.
 */
function isPermanentFailure(error: unknown): boolean {
  return typeof error === 'object' && error !== null && typeof (error as { code?: unknown }).code === 'string';
}

export interface FlushResult {
  synced: Expense[];
  /** Ids dropped because the server rejected the row itself */
  rejected: string[];
  /** Still queued because the network was unavailable */
  remaining: number;
}

/**
 * Replay queued writes oldest-first, stopping at the first transient failure so
 * ordering is preserved for the next attempt.
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
      break; // Offline. Leave this and everything after it queued.
    }
  }

  return { synced, rejected, remaining: readQueue(userId).length };
}
