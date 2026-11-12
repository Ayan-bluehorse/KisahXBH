/**
 * Horizontal arrow slider for the PDP "Recommended For You" (Helium apps_UFMwwi) section.
 * Converts the stacked grid into a right-scrollable carousel with prev/next arrow controls
 * on both mobile and desktop viewports, and reacts cleanly if Helium mutates cards.
 */
(function () {
  'use strict';

  var ROOT_SELECTOR = '[id*="apps_UFMwwi"] .helium-custom-recommendations';
  var TRACK_SELECTOR = 'ul.helium-grid-container, ul.helium-rec-slider-track, ul.product-grid';

  function createArrowButton(direction) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kisah-rec-arrow kisah-rec-arrow--' + direction;
    btn.setAttribute(
      'aria-label',
      direction === 'prev' ? 'Previous recommended products' : 'Next recommended products'
    );
    btn.innerHTML =
      direction === 'prev'
        ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    return btn;
  }

  function getCardStep(track) {
    var cards = track.querySelectorAll(':scope > .helium-card-wrapper');
    var firstVisible = null;
    for (var i = 0; i < cards.length; i++) {
      if (
        !cards[i].classList.contains('helium-hidden') &&
        window.getComputedStyle(cards[i]).display !== 'none'
      ) {
        firstVisible = cards[i];
        break;
      }
    }
    if (!firstVisible) return track.clientWidth * 0.8;

    var trackStyle = window.getComputedStyle(track);
    var gap = parseFloat(trackStyle.columnGap || trackStyle.gap || '12') || 12;
    var cardWidth = firstVisible.getBoundingClientRect().width;
    if (!cardWidth) return track.clientWidth * 0.8;

    var unit = cardWidth + gap;
    var visibleCount = Math.max(1, Math.floor((track.clientWidth + gap + 2) / unit));
    return unit * visibleCount;
  }

  function initSliderRoot(root) {
    if (!root) return;
    var track = root.querySelector(TRACK_SELECTOR);
    if (!track || !track.children || track.children.length === 0) return;

    root.classList.add('kisah-rec-slider-root');
    track.classList.add('kisah-rec-track');

    var viewport = track.parentElement;
    if (!viewport || !viewport.classList.contains('kisah-rec-viewport')) {
      viewport = document.createElement('div');
      viewport.className = 'kisah-rec-viewport';
      track.parentNode.insertBefore(viewport, track);
      viewport.appendChild(track);
    }

    var prevBtn = viewport.querySelector(':scope > .kisah-rec-arrow--prev');
    var nextBtn = viewport.querySelector(':scope > .kisah-rec-arrow--next');

    if (!prevBtn) {
      prevBtn = createArrowButton('prev');
      viewport.appendChild(prevBtn);
    }
    if (!nextBtn) {
      nextBtn = createArrowButton('next');
      viewport.appendChild(nextBtn);
    }

    if (viewport.dataset.kisahRecBound === '1') {
      return;
    }
    viewport.dataset.kisahRecBound = '1';

    function updateArrows() {
      var canScroll = track.scrollWidth > track.clientWidth + 4;
      if (!canScroll) {
        prevBtn.classList.add('is-hidden');
        nextBtn.classList.add('is-hidden');
        return;
      }
      var sl = track.scrollLeft;
      var maxScroll = track.scrollWidth - track.clientWidth - 4;
      prevBtn.classList.toggle('is-hidden', sl <= 4);
      nextBtn.classList.toggle('is-hidden', sl >= maxScroll);
    }

    viewport._kisahRecUpdate = updateArrows;

    function animateScrollBy(delta) {
      if (track._kisahRecAnimId) {
        cancelAnimationFrame(track._kisahRecAnimId);
        track._kisahRecAnimId = 0;
      }
      if (track._kisahRecFallbackTimer) {
        clearTimeout(track._kisahRecFallbackTimer);
        track._kisahRecFallbackTimer = 0;
      }

      var start = track.scrollLeft;
      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      var target = Math.max(0, Math.min(maxScroll, Math.round(start + delta)));
      if (target === Math.round(start)) {
        updateArrows();
        return;
      }

      var reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion || typeof requestAnimationFrame !== 'function') {
        track.scrollLeft = target;
        updateArrows();
        return;
      }

      var duration = 280;
      var startTime = performance.now();

      function finish() {
        track._kisahRecAnimId = 0;
        if (track._kisahRecFallbackTimer) {
          clearTimeout(track._kisahRecFallbackTimer);
          track._kisahRecFallbackTimer = 0;
        }
        track.scrollLeft = target;
        updateArrows();
      }

      track._kisahRecFallbackTimer = setTimeout(finish, duration + 80);

      function step(now) {
        var elapsed = Math.max(0, now - startTime);
        var progress = Math.min(1, elapsed / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        track.scrollLeft = start + (target - start) * eased;

        if (progress < 1) {
          track._kisahRecAnimId = requestAnimationFrame(step);
        } else {
          finish();
        }
      }

      track._kisahRecAnimId = requestAnimationFrame(step);
    }

    prevBtn.addEventListener('click', function () {
      animateScrollBy(-getCardStep(track));
    });

    nextBtn.addEventListener('click', function () {
      animateScrollBy(getCardStep(track));
    });

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows, { passive: true });

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(updateArrows);
      ro.observe(track);
    }

    if (typeof MutationObserver === 'function') {
      var trackObserver = new MutationObserver(function () {
        requestAnimationFrame(updateArrows);
      });
      trackObserver.observe(track, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style']
      });
    }

    requestAnimationFrame(updateArrows);
  }

  function scan() {
    var roots = document.querySelectorAll(ROOT_SELECTOR);
    for (var i = 0; i < roots.length; i++) {
      initSliderRoot(roots[i]);
    }
  }

  function boot() {
    scan();
    if (typeof MutationObserver !== 'function') return;

    var host = document.getElementById('content') || document.body;
    if (!host) return;

    var docObserver = new MutationObserver(function () {
      scan();
    });
    docObserver.observe(host, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

