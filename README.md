# Adam Carr — Video Editor Portfolio

A premium, single-page portfolio site for a freelance video editor, built with
plain HTML, CSS and JavaScript — no frameworks, no build step. Ready to push
straight to GitHub Pages.

The whole site borrows its visual language from a video editing timeline:
a scroll-driven timeline ruler with a live timecode runs across the top of
every page, the "Process" section is laid out as a literal timeline with a
moving playhead, and each project video has a working scrubber bar.

---

## 1. Folder structure

```
adam-carr-portfolio/
├── index.html              All markup, single page
├── css/
│   ├── style.css           Variables, layout, components
│   ├── animations.css      Keyframes + scroll-reveal states
│   └── responsive.css      Breakpoints (mobile-first overrides)
├── js/
│   ├── scroll.js           Nav scroll state, reveal-on-scroll, mobile menu
│   ├── timeline.js         Page timeline ruler, process playhead,
│   │                       hero/contact canvas backgrounds, waveforms,
│   │                       animated stat counters
│   ├── videos.js           Lazy-load + autoplay/pause + scrubber logic
│   └── main.js              Custom cursor, magnetic buttons, anchor scroll
├── images/
│   ├── adam.jpg             Headshot (placeholder — see below)
│   ├── project1-4-poster.jpg  Poster frames for each project video
│   ├── clients/              Client wordmark SVGs (placeholders)
│   └── icons/                Software + social SVG icons
├── videos/
│   ├── project1.mp4 … project4.mp4   Placeholder showreel clips
└── README.md
```

---

## 2. About the placeholder media

Because this repo ships without access to Adam's real footage and photos,
**every video and most images are generated placeholders**:

- `videos/project1-4.mp4` are short synthetic gradient/test clips with the
  project title burned in, so the site is fully functional (autoplay, loop,
  scrubbing) the moment you open it.
- `images/adam.jpg` is a generated portrait-shaped placeholder frame.
- `images/clients/*.svg` are simple text wordmarks standing in for real
  client logos.
- `images/icons/*.svg` are simple monochrome glyphs for software/social
  icons — feel free to swap for official brand marks if you have license to
  use them.

Replace these with real assets before launch (see next section).

---

## 3. How to replace videos

1. Export your clips as **H.264 MP4**, ideally already compressed for web
   (1080p or 720p, ~5–15 Mbps, no audio track needed since previews are muted).
2. Drop the files into `/videos/`, keeping or changing the filenames.
3. In `index.html`, find each `<video class="project-video" ...>` block
   inside the `#work` section and update:
   ```html
   <video class="project-video" muted loop playsinline preload="none"
          poster="images/your-poster.jpg"
          data-src="videos/your-clip.mp4">
   </video>
   ```
   - `data-src` (not `src`) is intentional — `js/videos.js` lazy-loads the
     real source only once the player scrolls near the viewport.
   - `poster` is the static image shown before the video loads/plays;
     generate one with `ffmpeg -i your-clip.mp4 -vframes 1 poster.jpg`.
4. Update the adjacent `<h3 class="project__title">`, description, and the
   `<dl class="project__meta">` (Client / Category / Duration) to match.

To add a **fifth project**, duplicate one `<article class="project">` block
(add `project--reverse` to alternate the layout) and append it inside
`#projectList`.

---

## 4. How to replace images

- **Headshot:** replace `images/adam.jpg` with a real photo of the same
  rough aspect ratio (portrait, ~4:5). No HTML changes needed if you keep
  the filename; otherwise update the `<img>` `src` in the `#about` section.
- **Client logos:** replace files in `images/clients/` (SVG or PNG both
  work). Update the `<img>` `src`/`alt` pairs in `.about__clients-row`.
- **Icons:** anything in `images/icons/` can be swapped for branded icon
  sets — keep them roughly square and they'll inherit sizing automatically.

All images use `loading="lazy"` and explicit `width`/`height` to avoid
layout shift — keep those attributes accurate when you swap files.

---

## 5. Editing content

Everything else (bio copy, stats, skills tags, process steps, testimonials,
contact email, social links) lives directly in `index.html` as plain text —
search for the relevant section comment (`<!-- ============ ABOUT ============ -->`,
etc.) and edit in place. No build step or templating engine is involved.

Animated counters in the About section read their target value from the
`data-count` attribute, e.g.:
```html
<span class="stat__num" data-count="180">0</span>
```
Change the number, the animation handles the rest.

---

## 6. Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `adam-carr-portfolio`).
2. Push this folder's contents to the repository root:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then **Save**.
6. GitHub will publish the site at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```
   (this can take a minute or two on first deploy).

No build tools, bundlers, or `node_modules` are required — the site is
static files served as-is.

---

## 7. Notes on performance & accessibility

- Videos use `preload="none"` and are only given a `src` via JavaScript once
  they're near the viewport, then paused automatically when scrolled out of
  view.
- All interactive controls are keyboard reachable with visible focus states;
  the custom cursor and parallax canvases are disabled automatically for
  touch devices and for users with `prefers-reduced-motion` enabled.
- Structured data (`Person` schema), Open Graph and Twitter Card meta tags
  are included in `<head>` — update the placeholder URLs once the site has
  a real domain.
