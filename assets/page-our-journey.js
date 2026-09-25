/**
 * Standalone Page: Our Journey Editorial
 * High performance, vanilla JS interactions
 */
(function () {
  'use strict';

  function initOurJourney() {
    const page = document.querySelector('.our-journey-page');
    if (!page) return;

    // 1. Smooth scroll for internal jump links
    const jumpLinks = page.querySelectorAll('a[href^="#"]');
    jumpLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = page.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const navOffset = 80;
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

    // 2. Active Chapter Highlight on Scroll
    const chapterNavLinks = page.querySelectorAll('.chapter-nav a');
    const sections = [];
    chapterNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = page.querySelector(href);
        if (section) {
          sections.push({ link, section });
        }
      }
    });

    if (sections.length > 0 && 'IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
      };

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const activeId = '#' + entry.target.id;
            chapterNavLinks.forEach(link => {
              if (link.getAttribute('href') === activeId) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach(item => {
        sectionObserver.observe(item.section);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOurJourney);
  } else {
    initOurJourney();
  }
})();
