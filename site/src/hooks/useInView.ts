// rtmx:req REQ-SITE-029
import { useEffect, useState, type RefObject } from 'react';

type UseInViewOptions = {
  /** Distance outside the viewport at which the element counts as visible. */
  rootMargin?: string;
  /** Keep reporting true after the first intersection instead of tracking exit. */
  once?: boolean;
};

/**
 * Reports whether the element referenced by `ref` is inside (or near) the
 * viewport.
 *
 * With `once: true` the observer disconnects on first intersection, which suits
 * expensive one-shot work such as rendering a symbol thumbnail. The default
 * tracks exit as well, so callers can unmount offscreen content and keep large
 * grids to a bounded number of DOM nodes.
 */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  { rootMargin = '200px', once = false }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Environments without IntersectionObserver (jsdom, older WebViews) render
    // everything rather than nothing.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}

export default useInView;
