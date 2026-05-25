import { useEffect } from 'react';

/**
 * Watches all [data-reveal] elements and adds the .revealed class
 * when they enter the viewport. Supports directional variants:
 *   data-reveal="up" | "left" | "right" | "scale"
 * Optional data-delay="150" adds a CSS transition-delay in ms.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.dataset.delay ? `${el.dataset.delay}ms` : '0ms';
          el.style.transitionDelay = delay;
          el.classList.add('revealed');
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    // Observe after a short tick so elements are painted
    const id = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(id);
      observer.disconnect();
    };
  }, []);
}
