# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Node version**: the system default is v16, which is too old. Always prefix commands with the Node 18 path:

```bash
PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" npx astro dev --host   # dev server → localhost:4321
PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" npx astro build         # production build → dist/
PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" npx astro check         # TypeScript type-check (no errors = green)
PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" npm install             # install deps
```

There are no tests. `astro check` is the only automated quality gate.

## Architecture

Static SSG landing page (no backend, no JS framework). One page: `src/pages/index.astro`.

**Data flow**: all content lives in `src/data/business.ts` → imported by `src/pages/index.astro` and `src/components/HeroScroll.astro`. To change copy, phone, or links, edit only that file.

**Hero animation**: `src/components/HeroScroll.astro` renders a `<section>` (height: 320vh) with a sticky canvas inside. As the user scrolls, `src/scripts/scroll-frames.ts` (`ScrollFrames` class) maps scroll progress 0→1 to frame index 0→102 and draws each PNG onto the canvas using `object-fit: contain` logic. Frames live in `public/frames/` (103 files, named `coffe-machine-detouching_out0001.png` … `0103.png`). A white 210×65px patch is drawn over the bottom-right corner of each frame to cover the KlingAI watermark.

**Responsive info block**: on `< 768px` the overlay card is `display: none`; a sibling `.hero__mobile` div (outside `<section class="hero">`) renders below the 320vh scroll section. On `≥ 768px` the floating glass card (`.hero__card`) is shown as an absolute overlay, hidden `.hero__mobile` is hidden.

**Phone button behaviour**: on pointer-coarse / hover-none devices the `tel:` href fires normally. On desktop, `click` is intercepted and the phone number is copied to clipboard via `navigator.clipboard`.

**Styles**: SCSS with BEM. Global tokens in `src/styles/_variables.scss` (palette, spacing, breakpoints). Mixins in `src/styles/_mixins.scss` (`respond-to(sm|md|lg)`, `container`, `tech-label`, `reduced-motion`). Component styles are scoped inside each `.astro` file.

**Canvas background**: white (`#ffffff`) — matches the white background of the PNG frames so there are no colour-band artefacts in `contain` mode.

**Deployment target**: Netlify static. Site URL configured in `astro.config.mjs` (`site: 'https://coffee-repair-master.netlify.app'`).
