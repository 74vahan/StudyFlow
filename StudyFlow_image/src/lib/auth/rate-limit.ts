// Tiny in-memory rate limiter with lockout, used to slow down brute-forcing the
// teacher PIN. State lives in the Node process (fine for one instance / an exam
// demo); a multi-instance deploy would need a shared store (Redis).

interface Entry {
  fails: number;
  lockedUntil: number;
}

const MAX_FAILS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map<string, Entry>();

// Returns remaining lock time in ms (0 if not locked).
export function lockedFor(key: string): number {
  const e = store.get(key);
  if (!e) return 0;
  const left = e.lockedUntil - Date.now();
  return left > 0 ? left : 0;
}

export function recordFailure(key: string): void {
  const e = store.get(key) ?? { fails: 0, lockedUntil: 0 };
  e.fails += 1;
  if (e.fails >= MAX_FAILS) {
    e.lockedUntil = Date.now() + LOCKOUT_MS;
    e.fails = 0;
  }
  store.set(key, e);
}

export function recordSuccess(key: string): void {
  store.delete(key);
}
