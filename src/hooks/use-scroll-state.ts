/**
 * Shared scroll-state hooks used across public marketing pages.
 *
 * Extracted here to avoid duplicating the same ~20 lines in every page file.
 */
import { useState, useEffect, useRef } from "react";

/**
 * Returns true once the window has been scrolled past `threshold` pixels.
 * Useful for adding a shadow to sticky navbars.
 */
export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Returns [ref, inView] where inView flips to true the first time the element
 * enters the viewport. The observer is disconnected afterwards so the state
 * never reverts - safe for entrance animations.
 */
export function useInView(
  threshold = 0.12,
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}
