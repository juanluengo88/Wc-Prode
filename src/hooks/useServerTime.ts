'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a `getTime()` function that always yields a server-anchored UTC
 * timestamp in milliseconds.
 *
 * Why not Date.now()? A user can change their system clock to bypass the
 * 15-minute prediction lock. This hook fetches the real server time once on
 * mount and re-syncs every `resyncIntervalMs` (default 60 s). Between resyncs
 * it advances the clock using performance.now(), which is a monotonic counter
 * that is unaffected by system clock changes.
 *
 * Usage:
 *   const getTime = useServerTime();
 *   const locked = matchTime - getTime() <= LOCK_THRESHOLD;
 */
export function useServerTime(resyncIntervalMs = 60_000) {
  // { serverMs, perfMs } — both captured at the same instant after a fetch
  const anchor = useRef<{ serverMs: number; perfMs: number } | null>(null);

  const sync = useCallback(async () => {
    try {
      // Bracket the request to estimate one-way network latency
      const t0 = performance.now();
      const res = await fetch('/api/time');
      const t1 = performance.now();
      const { utc } = await res.json();
      // Correct for ~half the round-trip time
      anchor.current = {
        serverMs: utc + (t1 - t0) / 2,
        perfMs: performance.now(),
      };
    } catch {
      // On failure keep the existing anchor; worst case we stay slightly off
    }
  }, []);

  useEffect(() => {
    sync(); // initial fetch
    const id = setInterval(sync, resyncIntervalMs);
    return () => clearInterval(id);
  }, [sync, resyncIntervalMs]);

  // Derives the current server time from the monotonic clock offset
  const getTime = useCallback((): number => {
    if (!anchor.current) return Date.now(); // safe fallback before first response
    return anchor.current.serverMs + (performance.now() - anchor.current.perfMs);
  }, []);

  return getTime;
}
