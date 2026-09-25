/**
 * Standalone Page: Brand Page / Brand Vibe
 * Optimized vanilla JS with 60fps Parallax & Animations
 */
(function () {
  'use strict';

  function initBrandVibe() {
    const page = document.querySelector('.brand-vibe-page');
    if (!page) return;

    const nav = page.querySelector('.nav');
    const bar = page.querySelector('.progress span');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parallaxElements = page.querySelectorAll('[data-parallax]');

    // Smooth anchor scrolling
    const anchorLinks = page.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = page.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const navOffset = 60;
            const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Optimized scroll handler using requestAnimationFrame
    let ticking = false;

    function handleScroll() {
      const y = window.scrollY;
      const innerHeight = window.innerHeight;

      // Nav scroll state
      if (nav) {
        nav.classList.toggle('scrolled', y > 40);
      }

      // Progress bar
      if (bar) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (y / max * 100) : 0) + '%';
      }

      // Parallax effect
      if (!reduced && parallaxElements.length > 0) {
        parallaxElements.forEach(el => {
          const parent = el.parentElement;
          if (!parent) return;
          const r = parent.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) {
            const speed = Number(el.dataset.parallax || 0.08);
            const offset = (r.top - innerHeight / 2) * speed;
            el.style.transform = `scale(1.05) translate3d(0, ${offset.toFixed(2)}px, 0)`;
          }
        });
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for reveal elements
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -4%'
      });

      page.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = Math.min((i % 4) * 70, 210) + 'ms';
        io.observe(el);
      });
    } else {
      page.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandVibe);
  } else {
    initBrandVibe();
  }
})();
