/*
 * All cached client state is namespaced by user id.
 *
 * The previous unscoped `spendly_monthly_budget` key meant signing out and
 * signing in as someone else showed the first user's budget until the network
 * caught up. With an allowance number driving spending decisions, showing one
 * person another person's figure is not a cosmetic bug, so every key goes
 * through here and every key is dropped on sign-out.
 */

const PREFIX = 'spendly:v2:';

function scopedKey(userId: string, key: string) {
  return `${PREFIX}${userId}:${key}`;
}

export function readScoped<T>(userId: string | null, key: string, fallback: T): T {
  if (!userId || typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(scopedKey(userId, key));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeScoped(userId: string | null, key: string, value: unknown): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(scopedKey(userId, key), JSON.stringify(value));
  } catch {
    // Quota or private-mode failures are not worth breaking a save over.
  }
}

export function removeScoped(userId: string | null, key: string): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(scopedKey(userId, key));
  } catch {
    // ignore
  }
}

/** Wipe every namespaced key. Called on sign-out so nothing leaks to the next user. */
export function clearAllScoped(): void {
  if (typeof window === 'undefined') return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(PREFIX)) doomed.push(key);
    }
    doomed.forEach((key) => window.localStorage.removeItem(key));

    // Legacy unscoped keys from before budgets were namespaced.
    window.localStorage.removeItem('spendly_monthly_budget');
  } catch {
    // ignore
  }
}
