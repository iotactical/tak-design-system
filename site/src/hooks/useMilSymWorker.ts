// rtmx:req REQ-XW-137
import { useEffect, useRef, useCallback, useState } from 'react';

interface PendingRequest {
  resolve: (svg: string | null) => void;
  reject: (err: Error) => void;
}

interface RenderResult {
  svg: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that manages a Web Worker for mil-sym-ts rendering.
 * Returns a renderSymbol function that queues render requests
 * and resolves with SVG strings.
 *
 * Results are memoized by SIDC+size+modifiers key to avoid redundant renders.
 */
export function useMilSymWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/milsym-worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const { id, svg, error } = e.data;
      const pending = pendingRef.current.get(id);
      if (pending) {
        pendingRef.current.delete(id);
        if (error) {
          pending.resolve(null);
        } else if (svg) {
          // Cache the result
          cacheRef.current.set(id, svg);
          pending.resolve(svg);
        } else {
          pending.resolve(null);
        }
      }
    };

    worker.onerror = () => {
      // Reject all pending requests on worker-level error
      for (const [, pending] of pendingRef.current) {
        pending.resolve(null);
      }
      pendingRef.current.clear();
    };

    workerRef.current = worker;
    setReady(true);

    return () => {
      worker.terminate();
      workerRef.current = null;
      // Resolve remaining pending requests as null
      for (const [, pending] of pendingRef.current) {
        pending.resolve(null);
      }
      pendingRef.current.clear();
    };
  }, []);

  const renderSymbol = useCallback(
    (
      sidc: string,
      size: number = 50,
      modifiers?: Record<string, string>
    ): Promise<string | null> => {
      // Build cache key from sidc + size + sorted modifiers
      const modKey = modifiers
        ? JSON.stringify(Object.entries(modifiers).sort())
        : '';
      const cacheKey = `${sidc}:${size}:${modKey}`;

      // Return cached result if available
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        return Promise.resolve(cached);
      }

      // If worker not ready, return null
      if (!workerRef.current) {
        return Promise.resolve(null);
      }

      return new Promise((resolve) => {
        pendingRef.current.set(cacheKey, { resolve, reject: () => resolve(null) });
        workerRef.current!.postMessage({
          id: cacheKey,
          sidc,
          size,
          modifiers,
        });
      });
    },
    []
  );

  return { renderSymbol, ready };
}

export default useMilSymWorker;
