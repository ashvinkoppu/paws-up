/**
 * @file ScrollToTop.tsx
 *
 * Renderless component that scrolls the window to the top whenever the
 * route pathname changes. Placed once near the root of the router tree,
 * it ensures users always start at the top of a new page rather than
 * retaining the scroll position from the previous route.
 *
 * Uses three scroll reset strategies (window.scrollTo, documentElement,
 * document.body) for cross-browser reliability. Also disables the
 * browser's native scroll restoration to prevent conflicts.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Use requestAnimationFrame to ensure DOM is ready before scrolling.
    // Three reset methods cover browser quirks: window.scrollTo for modern
    // browsers, documentElement for standards-mode, and body for quirks-mode.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  // Renderless component - contributes no DOM nodes.
  return null;
};

export default ScrollToTop;
