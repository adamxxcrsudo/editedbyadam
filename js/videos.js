/* ============================================================
   videos.js
   Handles: lazy-loading local <video> sources, autoplay-when-
   visible / pause-when-offscreen, and the custom per-project
   scrubber bar synced to real playback progress.
   ============================================================ */

(function () {
  'use strict';

  const videos = Array.from(document.querySelectorAll('.project-video'));
  if (!videos.length) return;

  /* ---------- Lazy-load: swap data-src -> src only when near viewport ---------- */
  const loadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && !video.src) {
          const src = video.dataset.src;
          if (src) {
            video.src = src;
            video.load();
          }
        }
      });
    },
    { rootMargin: '600px 0px 600px 0px' }
  );
  videos.forEach((v) => loadObserver.observe(v));

  /* ---------- Autoplay when visible, pause when offscreen ---------- */
  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          const playPromise = video.play();
          if (playPromise && playPromise.catch) playPromise.catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: [0, 0.4, 0.8] }
  );
  videos.forEach((v) => playObserver.observe(v));

  /* ---------- Custom scrubber per project ---------- */
  document.querySelectorAll('.video-wrap').forEach((wrap) => {
    const video = wrap.querySelector('.project-video');
    const scrubber = wrap.querySelector('[data-video-target]');
    const playBtn = wrap.querySelector('.video-wrap__play');
    if (!video || !scrubber) return;

    function setProgress(ratio) {
      const pct = Math.min(Math.max(ratio, 0), 1) * 100;
      scrubber.style.setProperty('--p', pct + '%');
    }

    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      setProgress(video.currentTime / video.duration);
    });

    // click-to-seek
    scrubber.addEventListener('click', (e) => {
      if (!video.duration) return;
      const rect = scrubber.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      video.currentTime = ratio * video.duration;
      setProgress(ratio);
    });

    // mute toggle / "play" affordance — videos already autoplay muted,
    // this button unmutes briefly for a deliberate listen, scoped per card.
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.project-video').forEach((v) => {
          if (v !== video) v.muted = true;
        });
        video.muted = !video.muted;
        playBtn.setAttribute('aria-pressed', String(!video.muted));
      });
    }
  });
})();
