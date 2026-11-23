type Entry = { start: number; count: number };
export function createAdviceRateLimiter(limit = 12, windowMs = 60_000) {
  const entries = new Map<string, Entry>();
  return (key: string, now = Date.now()) => {
    for (const [entryKey, entry] of entries) if (now - entry.start >= windowMs) entries.delete(entryKey);
    const entry = entries.get(key);
    if (!entry || now - entry.start >= windowMs) { entries.set(key, { start: now, count: 1 }); return true; }
    if (entry.count >= limit) return false;
    entry.count += 1; return true;
  };
}
