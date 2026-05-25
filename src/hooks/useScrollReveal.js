import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;

          // Apply delay then reveal
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('revealed');

          // After animation fully completes, remove the delay and transition
          // so future class changes (e.g. accordion open/close) are instant
          setTimeout(() => {
            el.style.transitionDelay = '0ms';
            el.style.transition = 'none'; // freeze — no more opacity/transform transitions on this element
          }, delay + 800);

          observer.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' },
    );

    const id = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    }, 60);

    return () => { clearTimeout(id); observer.disconnect(); };
  }, []);
}
