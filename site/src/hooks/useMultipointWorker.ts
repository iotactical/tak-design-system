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
let workerFailed = false;
let workerReady = false;
/** Subscribers notified when ready/failed state changes */
let stateListeners: Set<() => void> = new Set();

function notifyListeners() {
  for (const fn of stateListeners) fn();
}

function getWorker(): Worker | null {
  if (workerFailed) return null;
  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(
        new URL('../workers/multipoint-worker.ts', import.meta.url),
        { type: 'module' }
      );

      sharedWorker.onmessage = (e: MessageEvent) => {
        // Worker sends { type: 'ready' } once the module loads successfully
        if (e.data && e.data.type === 'ready') {
          workerReady = true;
          notifyListeners();
          return;
        }

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
        // If the worker errored before becoming ready, it means module
        // loading failed (e.g. browser doesn't support module Workers)
        if (!workerReady) {
          workerFailed = true;
          sharedWorker?.terminate();
          sharedWorker = null;
        }
        for (const [, pending] of sharedPending) {
          pending.resolve(null);
        }
        sharedPending.clear();
        notifyListeners();
      };
    } catch (e) {
      console.warn('[multipoint-worker] Worker creation failed:', e);
      workerFailed = true;
      return null;
    }
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
    workerReady = false;
    refCount = 0;
  }
}

/**
 * Hook that manages a shared Web Worker for multi-point tactical graphics rendering.
 * All components share a single worker instance. Results are memoized by key.
 */
export function useMultipointWorker() {
  const [ready, setReady] = useState(workerReady);
  const [unsupported, setUnsupported] = useState(workerFailed);

  useEffect(() => {
    const w = getWorker();
    if (!w) {
      setUnsupported(true);
      return;
    }
    refCount++;

    // If already ready (cached worker), set immediately
    if (workerReady) setReady(true);
    if (workerFailed) setUnsupported(true);

    // Subscribe to future state changes
    const listener = () => {
      if (workerReady) setReady(true);
      if (workerFailed) setUnsupported(true);
    };
    stateListeners.add(listener);

    return () => {
      stateListeners.delete(listener);
      releaseWorker();
    };
  }, []);

  const renderMultipoint = useCallback(
    (
      symbolCode: string,
      controlPoints: string,
      scale: number,
      bbox: string,
      modifiers?: Record<string, string>,
      attributes?: Record<string, string>,
      pixelWidth?: number,
      pixelHeight?: number,
    ): Promise<string | null> => {
      const modKey = modifiers
        ? JSON.stringify(Object.entries(modifiers).sort())
        : '';
      const pxKey = pixelWidth ? `:${pixelWidth}x${pixelHeight}` : '';
      const cacheKey = `${symbolCode}:${scale}:${controlPoints}:${bbox}:${modKey}${pxKey}`;

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
          pixelWidth,
          pixelHeight,
        });
      });
    },
    []
  );

  return { renderMultipoint, ready, unsupported };
}

export default useMultipointWorker;
