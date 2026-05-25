import { useEffect, useRef } from 'react';

/**
 * Applies a CSS translateY parallax to the returned ref element.
 * speed: 0 = no movement, 0.5 = half scroll speed (moves up as you scroll down)
 * Use negative speed to move down as you scroll.
 */
export function useParallax(speed = 0.25) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on low-power preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf;
    function update() {
      if (!el) return;
      const rect = el.closest('section')?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${centerOffset * speed}px)`;
    }

    function onScroll() {
      raf = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial position
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}
