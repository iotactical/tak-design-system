# REQ-XW-202: Lazy mil-sym-ts Worker Initialization

## Description

The `useMilSymWorker` hook currently creates a Web Worker in a `useEffect` on mount, regardless of whether the consumer actually calls `renderSymbol()`. This means any component that uses the hook pays the cost of worker instantiation and mil-sym-ts initialization even if the user never triggers a render. Change the worker creation to lazy initialization: the Worker should only be created when `renderSymbol()` is called for the first time.

## Acceptance Criteria

1. The `useMilSymWorker` hook does not create a Web Worker during `useEffect` or on component mount.
2. The Worker is created on the first invocation of `renderSymbol()` (or equivalent render function returned by the hook).
3. Subsequent calls to `renderSymbol()` reuse the same Worker instance (do not create a new Worker per call).
4. The Worker is still properly terminated on component unmount (cleanup function in `useEffect` or equivalent).
5. The hook's public API (function signature, return type) remains unchanged; this is a purely internal optimization.
6. If `renderSymbol()` is never called during the component lifecycle, no Worker is ever created and no resources are consumed.
7. The lazy initialization is thread-safe with respect to React's concurrent mode: rapid successive calls to `renderSymbol()` before the Worker is ready must not create multiple Workers.

## Test Approach

- **Static analysis**: Read the hook source and verify that no `new Worker(...)` call appears inside `useEffect` or at the top level of the hook. Confirm that Worker creation is inside the `renderSymbol` function (or a helper called by it) behind an initialization guard.
- **Unit test**: Mount a component that uses `useMilSymWorker` but does not call `renderSymbol()`. Assert that no Worker was instantiated (mock the Worker constructor and verify zero calls).
- **Unit test**: Mount a component, call `renderSymbol()` twice, assert the Worker constructor was called exactly once.
- **Unit test**: Mount and unmount a component that called `renderSymbol()` once. Assert the Worker's `terminate()` method was called on unmount.

## Implementation Notes

- Use a `useRef` to hold the Worker instance. Initialize it to `null`. In `renderSymbol()`, check `if (!workerRef.current)` before creating.
- To handle concurrent mode / strict mode double-invocation, consider using a ref-based lock or ensuring idempotency of the initialization.
- The cleanup function should check `if (workerRef.current)` before calling `terminate()`.
- This pattern is sometimes called "lazy ref initialization" and is a standard React optimization.

## Effort Estimate

0.25 weeks
