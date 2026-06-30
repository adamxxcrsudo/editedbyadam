/* ============================================================
   scroll.js
   Handles: sticky nav state, scroll-reveal (IntersectionObserver),
   back-to-top, mobile menu toggle, smooth in-page navigation.
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav blur on scroll ---------- */
  const nav = document.getElementById('siteNav');
  let lastScrollY = window.scrollY;

  function updateNavState() {
    if (window.scrollY > 12) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScrollY = window.scrollY;
  }
  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
    mobileMenu.classList.toggle('is-open', !isOpen);
    burger.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      mobileMenu.hidden = true;
      mobileMenu.classList.remove('is-open');
    });
  });

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  const revealEls = document.querySelectorAll('.reveal-up');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero scroll indicator ---------- */
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* expose for other modules */
  window.AdamCarr = window.AdamCarr || {};
  window.AdamCarr.reducedMotion = reducedMotion;
})();
