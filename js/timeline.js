/* ============================================================
   timeline.js
   Handles: page-wide scroll timeline ruler + global timecode,
   process-section playhead, hero & contact canvas backgrounds,
   waveform divider bars, animated stat counters.
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = (window.AdamCarr && window.AdamCarr.reducedMotion) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. PAGE TIMELINE RULER + GLOBAL TIMECODE
     The whole page is treated as one long "clip": scroll progress
     drives a fill bar, a playhead, and a timecode readout.
     ============================================================ */
  const fill = document.querySelector('.page-timeline__fill');
  const playhead = document.querySelector('.page-timeline__playhead');
  const tcReadout = document.getElementById('globalTimecode');

  // total runtime of the page "clip", purely cosmetic (mm:ss-ish at 24fps)
  const TOTAL_FRAMES = 24 * 60 * 4; // pretend the page is a 4 minute timeline

  function frameToTimecode(frame) {
    const fps = 24;
    const totalSeconds = Math.floor(frame / fps);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    const f = String(Math.floor(frame % fps)).padStart(2, '0');
    return `${h}:${m}:${s}:${f}`;
  }

  function updatePageTimeline() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

    if (fill) fill.style.width = (progress * 100).toFixed(2) + '%';
    if (playhead) playhead.style.left = (progress * 100).toFixed(2) + '%';
    if (tcReadout) tcReadout.textContent = frameToTimecode(progress * TOTAL_FRAMES);
  }

  let pageTicking = false;
  window.addEventListener('scroll', () => {
    if (!pageTicking) {
      requestAnimationFrame(() => {
        updatePageTimeline();
        pageTicking = false;
      });
      pageTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updatePageTimeline);
  updatePageTimeline();

  /* click a section marker label to jump there (desktop only markers, hidden via CSS but kept functional) */
  document.querySelectorAll('.page-timeline__markers [data-target]').forEach((marker) => {
    marker.addEventListener('click', () => {
      const target = document.querySelector(marker.dataset.target);
      if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================
     2. PROCESS SECTION PLAYHEAD
     Moves along the timeline line as the process section scrolls
     through the viewport.
     ============================================================ */
  const processSection = document.getElementById('processTimeline');
  const processFill = document.getElementById('processFill');
  const processPlayhead = document.getElementById('processPlayhead');

  function updateProcessPlayhead() {
    if (!processSection || !processFill || !processPlayhead) return;
    const rect = processSection.getBoundingClientRect();
    const vh = window.innerHeight;

    // progress 0 -> 1 as the section travels from entering to leaving viewport
    const start = vh * 0.85;
    const end = -rect.height + vh * 0.25;
    const raw = (start - rect.top) / (start - end);
    const progress = Math.min(Math.max(raw, 0), 1);

    processFill.style.width = (progress * 100).toFixed(2) + '%';
    processPlayhead.style.left = (progress * 100).toFixed(2) + '%';

    // light up clips as the playhead passes them
    document.querySelectorAll('.process-clip').forEach((clip, i, arr) => {
      const clipProgress = i / (arr.length - 1);
      if (progress >= clipProgress - 0.02) {
        clip.style.borderLeftWidth = '3px';
      }
    });
  }

  let processTicking = false;
  window.addEventListener('scroll', () => {
    if (!processTicking) {
      requestAnimationFrame(() => {
        updateProcessPlayhead();
        processTicking = false;
      });
      processTicking = true;
    }
  }, { passive: true });
  updateProcessPlayhead();

  /* ============================================================
     3. WAVEFORM DIVIDER BARS (generated, animated, full-bleed)
     ============================================================ */
  const BAR_UNIT = 7; // px per bar including its gap — controls density

  function buildWaveform(container) {
    if (!container) return;
    container.innerHTML = '';
    const barCount = Math.max(40, Math.ceil(container.clientWidth / BAR_UNIT));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('span');
      const h = 20 + Math.round(Math.sin(i * 0.4) * 30 + Math.random() * 40);
      bar.style.height = `${Math.max(8, h)}%`;
      if (!reducedMotion) {
        bar.style.animation = `barPulse ${1.2 + Math.random() * 1.6}s ease-in-out ${Math.random() * 1.5}s infinite`;
      } else {
        bar.style.opacity = '.5';
        bar.style.transform = 'scaleY(.6)';
      }
      frag.appendChild(bar);
    }
    container.appendChild(frag);
  }

  const waveContainers = [
    document.getElementById('waveTop'),
    document.getElementById('waveMid'),
    document.getElementById('waveBottom'),
  ].filter(Boolean);

  waveContainers.forEach((c) => buildWaveform(c));

  let waveResizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(waveResizeTimer);
    waveResizeTimer = setTimeout(() => {
      waveContainers.forEach((c) => buildWaveform(c));
    }, 200);
  });

  /* ============================================================
     4. ANIMATED STAT COUNTERS
     ============================================================ */
  const statEls = document.querySelectorAll('[data-count]');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (reducedMotion) {
        el.textContent = target + suffix;
        statsObserver.unobserve(el);
        return;
      }
      const duration = 1400;
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statEls.forEach((el) => statsObserver.observe(el));

  /* ============================================================
     5. HERO CANVAS — animated editing-timeline background
     Soft glowing tracks with moving "clips" and a sweeping playhead.
     ============================================================ */
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let w, h, dpr;
    let clips = [];
    const TRACK_COUNT = 5;
    const colors = ['#4f7cff', '#8b5cf6', '#22d3ee', '#2dd4bf'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = heroCanvas.clientWidth;
      h = heroCanvas.clientHeight;
      heroCanvas.width = w * dpr;
      heroCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildClips();
    }

    function buildClips() {
      clips = [];
      const trackHeight = h / TRACK_COUNT;
      for (let t = 0; t < TRACK_COUNT; t++) {
        const clipCount = 2 + Math.floor(Math.random() * 2);
        for (let c = 0; c < clipCount; c++) {
          clips.push({
            track: t,
            x: Math.random() * w,
            width: 80 + Math.random() * 180,
            speed: 0.12 + Math.random() * 0.22,
            color: colors[(t + c) % colors.length],
            y: trackHeight * t + trackHeight / 2,
            h: Math.max(10, trackHeight * 0.34),
          });
        }
      }
    }

    let playheadX = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      // track lines
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      const trackHeight = h / TRACK_COUNT;
      for (let t = 0; t <= TRACK_COUNT; t++) {
        const y = t * trackHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // clips
      clips.forEach((clip) => {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = clip.color;
        ctx.shadowColor = clip.color;
        ctx.shadowBlur = 18;
        roundRect(ctx, clip.x, clip.y - clip.h / 2, clip.width, clip.h, 6);
        ctx.fill();
        ctx.restore();

        if (!reducedMotion) {
          clip.x += clip.speed;
          if (clip.x > w + clip.width) clip.x = -clip.width;
        }
      });

      // sweeping playhead
      if (!reducedMotion) {
        playheadX += 0.9;
        if (playheadX > w + 40) playheadX = -40;
      } else {
        playheadX = w * 0.5;
      }
      ctx.save();
      ctx.strokeStyle = 'rgba(34,211,238,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(draw);
    }

    function roundRect(c, x, y, width, height, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + width, y, x + width, y + height, r);
      c.arcTo(x + width, y + height, x, y + height, r);
      c.arcTo(x, y + height, x, y, r);
      c.arcTo(x, y, x + width, y, r);
      c.closePath();
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }

  /* ============================================================
     6. CONTACT CANVAS — slow drifting gradient blobs
     ============================================================ */
  const contactCanvas = document.getElementById('contactCanvas');
  if (contactCanvas) {
    const ctx2 = contactCanvas.getContext('2d');
    let w2, h2, dpr2;
    const blobs = [
      { color: 'rgba(79,124,255,0.18)', r: 0.4, speed: 0.00018, offset: 0 },
      { color: 'rgba(139,92,246,0.16)', r: 0.32, speed: 0.00024, offset: 2 },
      { color: 'rgba(34,211,238,0.14)', r: 0.28, speed: 0.0002, offset: 4 },
    ];

    function resize2() {
      dpr2 = Math.min(window.devicePixelRatio || 1, 2);
      w2 = contactCanvas.clientWidth;
      h2 = contactCanvas.clientHeight;
      contactCanvas.width = w2 * dpr2;
      contactCanvas.height = h2 * dpr2;
      ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
    }

    function draw2(t) {
      ctx2.clearRect(0, 0, w2, h2);
      blobs.forEach((b) => {
        const angle = reducedMotion ? b.offset : t * b.speed + b.offset;
        const cx = w2 / 2 + Math.cos(angle) * w2 * 0.28;
        const cy = h2 / 2 + Math.sin(angle * 1.3) * h2 * 0.22;
        const radius = Math.min(w2, h2) * b.r;
        const grad = ctx2.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx2.fill();
      });
      requestAnimationFrame(draw2);
    }

    resize2();
    window.addEventListener('resize', resize2);
    requestAnimationFrame(draw2);
  }
})();
