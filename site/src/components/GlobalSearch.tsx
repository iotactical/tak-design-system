// rtmx:req REQ-XW-110
// rtmx:req REQ-XW-117
// rtmx:req REQ-XW-118
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex, type SearchEntry, type SearchCategory } from '../data/searchIndex';
import styles from './GlobalSearch.module.css';

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

/** Map category to badge CSS class */
const BADGE_CLASS: Record<SearchCategory, string> = {
  Tokens: styles.badgeTokens,
  Components: styles.badgeComponents,
  Icons: styles.badgeIcons,
  Palettes: styles.badgePalettes,
  Interfaces: styles.badgeInterfaces,
  '2525': styles.badge2525,
  Specs: styles.badgeSpecs,
};

/** Highlight matching substring in text */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <span className={styles.highlight}>{match}</span>
      {after}
    </>
  );
}

/** Simple debounce hook */
function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 200);

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const lower = debouncedQuery.toLowerCase();
    return searchIndex.filter(
      (entry) =>
        entry.name.toLowerCase().includes(lower) ||
        (entry.description && entry.description.toLowerCase().includes(lower)) ||
        entry.breadcrumb.toLowerCase().includes(lower),
    );
  }, [debouncedQuery]);

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<SearchCategory, SearchEntry[]>();
    for (const entry of results) {
      if (!map.has(entry.category)) map.set(entry.category, []);
      map.get(entry.category)!.push(entry);
    }
    // Limit each category to 8 results
    const ordered: { category: SearchCategory; entries: SearchEntry[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const entries = map.get(cat);
      if (entries && entries.length > 0) {
        ordered.push({ category: cat, entries: entries.slice(0, 8) });
      }
    }
    return ordered;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return grouped.flatMap((g) => g.entries);
  }, [grouped]);

  const handleSelect = useCallback(
    (entry: SearchEntry) => {
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
      navigate(entry.path);
    },
    [navigate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        return;
      }
      if (!isOpen || flatResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(flatResults[activeIndex]);
      }
    },
    [isOpen, flatResults, activeIndex, handleSelect],
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const wrapper = inputRef.current?.parentElement?.parentElement;
      if (wrapper && !wrapper.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-search-item]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const showDropdown = isOpen && debouncedQuery.length >= 2;

  let flatIdx = -1;

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.inputWrapper}>
        <svg className={styles.searchIcon} aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="Search tokens, components, icons, 2525..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Search design system"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
      </div>
      {showDropdown && (
        <div className={styles.dropdown} ref={dropdownRef} role="listbox">
          {grouped.length === 0 ? (
            <div className={styles.emptyState}>No results found</div>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.category}>
                  <div className={styles.categoryHeader}>{group.category}</div>
                  {group.entries.map((entry) => {
                    flatIdx++;
                    const idx = flatIdx;
                    return (
                      <div
                        key={`${entry.category}-${entry.name}-${idx}`}
                        className={`${styles.resultItem} ${idx === activeIndex ? styles.resultItemActive : ''}`}
                        onClick={() => handleSelect(entry)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        role="option"
                        aria-selected={idx === activeIndex}
                        data-search-item
                      >
                        <span className={`${styles.badge} ${BADGE_CLASS[entry.category]}`}>
                          {entry.category}
                        </span>
                        <span className={styles.resultName}>
                          {highlightMatch(entry.name, debouncedQuery)}
                        </span>
                        <span className={styles.resultBreadcrumb}>
                          {entry.breadcrumb}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className={styles.hint}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
