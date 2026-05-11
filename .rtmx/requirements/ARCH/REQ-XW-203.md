# REQ-XW-203: Lazy Data Loading via useDataLoader Hook

## Description

Several large JSON files are currently statically imported in page components, which means they are included in the JavaScript bundle and parsed at load time even if the user never visits the page that uses them. Move these files to `site/public/data/` and create a `useDataLoader` hook that fetches them at runtime via `fetch()`. Pages should import data through this hook instead of static `import` statements.

Affected files:
- `b-entities.json`
- `b2d.json`
- `verified-crosswalk.json`
- `crosswalk-validation.json`
- `c2d-reference.json`

## Acceptance Criteria

1. All five JSON files (`b-entities.json`, `b2d.json`, `verified-crosswalk.json`, `crosswalk-validation.json`, `c2d-reference.json`) exist in `site/public/data/`.
2. No page component or module statically imports any of these five JSON files (no `import data from '.../*.json'` statements for these files).
3. A `useDataLoader` hook exists (e.g., at `site/src/hooks/useDataLoader.ts`) that accepts a file path (relative to `/data/`) and returns `{ data, loading, error }`.
4. The hook fetches the JSON file via `fetch()` only on first call (or first mount of a consuming component) and caches the result so subsequent calls for the same path do not re-fetch.
5. Pages that previously imported these files now use `useDataLoader` and handle the `loading` and `error` states with appropriate UI (spinner/skeleton for loading, error message for failure).
6. The Vite build output does not include the JSON files in any JavaScript chunk; they appear as standalone files in `dist/data/`.
7. The application works correctly in both development (`vite dev`) and production (`vite build && vite preview`) modes.

## Test Approach

- **Static analysis**: Verify all five JSON files exist in `site/public/data/`.
- **Static analysis**: Grep the `site/src/` directory for static imports of the five JSON filenames; confirm zero matches.
- **Static analysis**: Verify `useDataLoader` hook file exists and exports a function.
- **Build verification**: Run `vite build` and confirm `dist/data/` contains the five JSON files and no JS chunk embeds them.
- **Unit test**: Mock `fetch`, render a component that uses `useDataLoader('b-entities.json')`, assert `fetch` is called with `/data/b-entities.json`, provide a mock response, and verify the component renders the data.
- **Unit test**: Call `useDataLoader` for the same file from two components simultaneously; assert `fetch` is called only once (caching).

## Implementation Notes

- The `useDataLoader` hook should use a module-level cache (e.g., a `Map<string, Promise<unknown>>`) so that multiple components requesting the same file share one fetch.
- Consider using `useSyncExternalStore` or a simple `useState` + `useEffect` pattern. If the project already uses React Query or SWR, prefer that.
- Files in Vite's `public/` directory are served as-is and copied to the build output root, so `site/public/data/foo.json` becomes `/data/foo.json` in production.
- The hook should handle JSON parse errors gracefully and surface them via the `error` return value.
- Consider adding a generic type parameter: `useDataLoader<T>(path: string): { data: T | null; loading: boolean; error: Error | null }`.

## Effort Estimate

0.5 weeks
