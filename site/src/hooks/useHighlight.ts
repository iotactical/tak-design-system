// rtmx:req REQ-XW-121
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads the `highlight` query param and scrolls the matching element into view
 * with a temporary yellow glow animation.
 *
 * Target elements must have a `data-highlight` attribute whose value matches
 * the query param.
 */
export function useHighlight() {
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight');
  useEffect(() => {
    if (!highlight) return;
    // Small delay to let the page render / tab switch settle
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-highlight="${CSS.escape(highlight)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 2000);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [highlight]);
  return highlight;
}

export default useHighlight;
