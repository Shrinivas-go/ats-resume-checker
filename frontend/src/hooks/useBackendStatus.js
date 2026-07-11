import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../config/api';

/**
 * Custom hook that polls the backend /health endpoint to detect
 * whether the server is awake and responsive.
 *
 * @param {Object}  options
 * @param {number}  options.interval   — polling interval in ms (default 2000)
 * @param {boolean} options.enabled    — whether polling is active (default true)
 * @returns {{ isReady: boolean, isChecking: boolean }}
 */
export function useBackendStatus({ interval = 2000, enabled = true } = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const checkHealth = useCallback(async () => {
    // If already confirmed ready, don't re-check
    if (!enabled) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/health`, {
        signal: abortRef.current.signal,
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setIsReady(true);
          setIsChecking(false);
          return; // stop polling — handled by effect cleanup
        }
      }
    } catch (err) {
      // Network error or aborted — backend is still asleep
      if (err.name !== 'AbortError') {
        // Expected when backend is down — keep polling
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    if (isReady) {
      // Already ready — stop polling
      return;
    }

    setIsChecking(true);

    // Immediate first check
    checkHealth();

    // Poll on interval
    timerRef.current = setInterval(checkHealth, interval);

    return () => {
      clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [enabled, isReady, interval, checkHealth]);

  return { isReady, isChecking };
}
