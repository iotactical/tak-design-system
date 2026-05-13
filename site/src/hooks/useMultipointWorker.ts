// rtmx:req REQ-XW-138
import { useEffect, useCallback, useState } from 'react';

interface PendingRequest {
  resolve: (geojson: string | null) => void;
}

// Shared singleton worker -- all components share one worker instance
let sharedWorker: Worker | null = null;
let sharedPending: Map<string, PendingRequest> = new Map();
let sharedCache: Map<string, string> = new Map();
let refCount = 0;

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL('../workers/multipoint-worker.ts', import.meta.url),
      { type: 'module' }
    );

    sharedWorker.onmessage = (e: MessageEvent) => {
      const { id, geojson, error } = e.data;
      const pending = sharedPending.get(id);
      if (pending) {
        sharedPending.delete(id);
        if (error) {
          console.warn('[multipoint-worker] error for', id, error);
          pending.resolve(null);
        } else if (geojson) {
          sharedCache.set(id, geojson);
          pending.resolve(geojson);
        } else {
          pending.resolve(null);
        }
      }
    };

    sharedWorker.onerror = (e) => {
      console.error('[multipoint-worker] worker error:', e);
      for (const [, pending] of sharedPending) {
        pending.resolve(null);
      }
      sharedPending.clear();
    };
  }
  return sharedWorker;
}

function releaseWorker() {
  refCount--;
  if (refCount <= 0 && sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
    sharedPending.clear();
    sharedCache.clear();
    refCount = 0;
  }
}

/**
 * Hook that manages a shared Web Worker for multi-point tactical graphics rendering.
 * All components share a single worker instance. Results are memoized by key.
 */
export function useMultipointWorker() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getWorker();
    refCount++;
    setReady(true);
    return () => { releaseWorker(); };
  }, []);

  const renderMultipoint = useCallback(
    (
      symbolCode: string,
      controlPoints: string,
      scale: number,
      bbox: string,
      modifiers?: Record<string, string>,
      attributes?: Record<string, string>
    ): Promise<string | null> => {
      const modKey = modifiers
        ? JSON.stringify(Object.entries(modifiers).sort())
        : '';
      const cacheKey = `${symbolCode}:${scale}:${controlPoints}:${bbox}:${modKey}`;

      const cached = sharedCache.get(cacheKey);
      if (cached) {
        return Promise.resolve(cached);
      }

      const worker = sharedWorker;
      if (!worker) {
        return Promise.resolve(null);
      }

      return new Promise((resolve) => {
        sharedPending.set(cacheKey, { resolve });
        worker.postMessage({
          id: cacheKey,
          symbolCode,
          controlPoints,
          scale,
          bbox,
          modifiers,
          attributes,
        });
      });
    },
    []
  );

  return { renderMultipoint, ready };
}

export default useMultipointWorker;
