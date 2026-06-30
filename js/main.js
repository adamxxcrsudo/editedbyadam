/* ============================================================
   main.js
   Handles: custom cursor, magnetic button hover effect,
   in-page anchor smooth scrolling with nav-height offset.
   Entry point — loaded last, after scroll/timeline/videos.
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = (window.AdamCarr && window.AdamCarr.reducedMotion) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ============================================================
     1. CUSTOM CURSOR
     ============================================================ */
  if (!isCoarsePointer) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) {
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
      }
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) {
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
      }
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    const interactiveSelector = 'a, button, .tag, .video-wrap, input, textarea';
    document.querySelectorAll(interactiveSelector).forEach((el) => {
      el.addEventListener('mouseenter', () => ring && ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring && ring.classList.remove('is-active'));
    });
  }

  /* ============================================================
     2. MAGNETIC BUTTONS
     ============================================================ */
  if (!reducedMotion && !isCoarsePointer) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ============================================================
     3. SMOOTH ANCHOR SCROLL WITH NAV OFFSET
     ============================================================ */
  const navHeight = document.getElementById('siteNav')?.offsetHeight || 84;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 4);
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* ============================================================
     4. ACTIVE NAV LINK ON SCROLL
     ============================================================ */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav__links a'));

  function setActiveLink() {
    const scrollPos = window.scrollY + navHeight + 40;
    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${current.id}`;
      link.style.color = match ? 'var(--text)' : '';
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();
})();
