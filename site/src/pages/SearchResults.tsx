// rtmx:req REQ-XW-112
import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { searchIndex, type SearchEntry, type SearchCategory } from '../data/searchIndex';

/** Category display order */
const CATEGORY_ORDER: SearchCategory[] = [
  'Components',
  'Tokens',
  'Icons',
  'Palettes',
  '2525',
  'Interfaces',
  'Specs',
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    document.title = query
      ? `Search: ${query} - TAK Design System`
      : 'Search - TAK Design System';
  }, [query]);

  // Build Fuse index
  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'breadcrumb', weight: 1 },
          { name: 'description', weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [],
  );

  // Full results (no cap)
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    return fuse.search(query);
  }, [query, fuse]);

  // Group by category (no limit per category)
  const grouped = useMemo(() => {
    const map = new Map<SearchCategory, { entry: SearchEntry; score: number }[]>();
    for (const r of results) {
      const cat = r.item.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ entry: r.item, score: r.score ?? 0 });
    }
    const ordered: { category: SearchCategory; items: { entry: SearchEntry; score: number }[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = map.get(cat);
      if (items && items.length > 0) {
        ordered.push({ category: cat, items });
      }
    }
    return ordered;
  }, [results]);

  const totalCount = results.length;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900 }}>
      <h1 style={{ color: '#DAD4BC', fontSize: 24, marginBottom: 8 }}>
        Search Results
      </h1>
      {query ? (
        <p style={{ color: '#878787', fontSize: 14, marginBottom: 24 }}>
          {totalCount} result{totalCount !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      ) : (
        <p style={{ color: '#878787', fontSize: 14, marginBottom: 24 }}>
          Enter a search query using the ?q= parameter.
        </p>
      )}

      {grouped.length === 0 && query.length >= 2 && (
        <div style={{ color: '#878787', padding: 32, textAlign: 'center' }}>
          No results found for &quot;{query}&quot;.
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.category} style={{ marginBottom: 32 }}>
          <h2
            style={{
              color: '#A89F91',
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
              borderBottom: '1px solid #333',
              paddingBottom: 6,
            }}
          >
            {group.category} ({group.items.length})
          </h2>
          {group.items.map(({ entry, score }, idx) => (
            <div
              key={`${entry.category}-${entry.name}-${idx}`}
              onClick={() => navigate(entry.path)}
              style={{
                padding: '10px 12px',
                marginBottom: 4,
                borderRadius: 4,
                cursor: 'pointer',
                opacity: 1 - score,
                background: 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              data-testid="search-result-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: '#333',
                    color: '#A89F91',
                  }}
                >
                  {entry.category}
                </span>
                <span style={{ color: '#DAD4BC', fontWeight: 500, fontSize: 14 }}>
                  {entry.name}
                </span>
              </div>
              <div style={{ color: '#6b6b6b', fontSize: 12, marginTop: 4 }}>
                {entry.breadcrumb}
              </div>
              {entry.description && (
                <div style={{ color: '#878787', fontSize: 13, marginTop: 4 }}>
                  {entry.description}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
