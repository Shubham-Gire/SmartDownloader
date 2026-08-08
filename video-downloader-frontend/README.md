# Grabit — All-in-One Video Downloader (Frontend)

A stylish, Gen-Z styled React + Tailwind CSS frontend for a video downloader
concept (YouTube, Instagram, Facebook, TikTok, X). Paste-a-link hero, platform
grid, how-it-works, features, stats, FAQ, footer — fully responsive.

This package is **frontend only**. There is no backend, and no logic that
fetches or extracts real video files from any platform — the "Grab it" button
simulates a loading state so you can see the UI flow. Wire it up to your own
backend/API before going live, and make sure whatever you build there complies
with each platform's terms of service and applicable copyright law.

## Tech

- React 18 + Vite
- Tailwind CSS (custom theme: colors, fonts, gradients, animations)
- lucide-react icons
- Fonts: Dancing Script (cursive accents), Space Grotesk (display/headings),
  Plus Jakarta Sans (body), JetBrains Mono (URL input & labels)

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Structure

```
src/
  components/
    Navbar.jsx
    Hero.jsx
    DownloadBar.jsx   <- the paste-a-link input (signature element)
    HowItWorks.jsx
    Platforms.jsx
    Stats.jsx
    Features.jsx
    FAQ.jsx
    Footer.jsx
  App.jsx
  main.jsx
  index.css
tailwind.config.js
index.html
```

## Customizing

- Colors, fonts and gradients all live in `tailwind.config.js` under `theme.extend`.
- Swap the logo mark / name "Grabit" in `Navbar.jsx` and `Footer.jsx`.
- `DownloadBar.jsx` is where you'd connect a real API call (`fetch`/`axios`)
  once you have a backend that resolves the pasted URL into a downloadable file.
