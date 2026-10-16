# Full rewrite plan

**Goal:** rewrite every source file from scratch, while the site looks and behaves
**exactly** the same: same layout, colours, motion, timing, autoplay and responsive
behaviour. Nothing visible changes.

**Baseline commit:** `76959ab` (Polish the hero) on `demo-3d-showcase`.
Everything is compared against this commit.

**How to resume:** say "start continue the project". Claude reads this file,
checks the Status list at the bottom, and continues from the first unchecked step.

---

## Ground rules

1. **Same output, verified, not assumed.** After every step, run
   `scripts/visual-check.mjs`. It takes 210 screenshots: 5 viewports × dark/light/reduced-motion
   × 14 scroll points through the hero, the dive and the showcase. Each one is
   compared pixel by pixel with the baseline. A step is done only when every shot matches.
2. **Keep class names and DOM structure.** The CSS, the screenshots and the
   autoplay all depend on them. The code inside a file can be rewritten freely; the
   markup it produces should stay the same.
3. **Keep every timing / maths constant exactly.** Examples: the dive's 170ms easing, `PORTAL_STEP`,
   `maxZoom × 1.08`, the 0.03 / 0.77 scroll mapping, the autoplay's ~27.5s schedule,
   the drop-in keyframes. Rename them if needed, but never change their values.
4. **One step = one commit.** If a step breaks something, revert just that commit.
5. **Data stays as it is.** Text, project lists, colours and card positions in `data/profile.ts`
   are content, not code. Only its types and structure are rewritten.

## Verification workflow

```bash
npm run dev                                   # keep running on :3000
# once, before any rewrite (on the baseline commit):
node scripts/visual-check.mjs capture .visual/baseline
# after each step:
node scripts/visual-check.mjs capture .visual/after
node scripts/visual-check.mjs compare .visual/baseline .visual/after
npx tsc --noEmit -p . && npx eslint
```

`compare` writes a red `*.diff.png` next to any shot that differs. `.visual/` is
gitignored.

Screenshots can't catch everything. After the hero and showcase steps, also check these by hand:

- [ ] `?play` autoplay runs end to end in ~27.5s, hero drops in, dive, Build scene, ring, tunnel
- [ ] `P` starts autoplay, `Esc` stops it, Auto Play button works
- [ ] Scroll the dive slowly forward and back: dot → portal hand-off is invisible, hole opens onto the cosmos, no stutter
- [ ] Quick jump back to top mid-dive: hero not blank, animations not paused
- [ ] Card hover: tilt, flood gradient, icon colour, neighbours recede
- [ ] Cursor spotlight follows the mouse
- [ ] Resize across 800px and 1200px; "Large text" setting re-fits the dot
- [ ] Light theme, Lite motion (`data-lite`), Reduce motion, phone layout
- [ ] Title sheen sweeps every ~7s; hero loops pause when scrolled away

## Current inventory (at baseline)

| File | Lines | What it does |
|---|---|---|
| `app/layout.tsx` | 58 | Fonts (Geist, Geist Mono, Source Serif 4), metadata, prefs boot script |
| `app/page.tsx` | 17 | Cosmos + MultitudesHero + Showcase3D |
| `app/globals.css` | 2080 | Tokens, cosmos, hero, **plus ~1,300 lines for components that no longer exist** |
| `app/styles/hero.css` | 135 | Autoplay drop-in, hero polish (CTA, cards, mid-width) |
| `app/styles/showcase.css` | 382 | Showcase3D: Build scene, ring, tunnel, HUD |
| `components/MultitudesHero.tsx` | 610 | Hero markup, `fitDot`, scroll dive, pointer polish, idle upkeep |
| `components/Showcase3D.tsx` | 562 | Showcase scenes + autoplay (`?play`, P / Esc) |
| `components/MultitudeArt.tsx` | 300 | Per-type gradients, ink colours and SVG icons |
| `components/Cosmos.tsx` | 16 | Fixed backdrop layer (`#cosmos`) |
| `components/PrefsSync.tsx` | 23 | Applies saved prefs on the client |
| `lib/prefs.ts` | 111 | Theme / text / motion prefs, FPS probe, boot script |
| `lib/site.ts` | 24 | Site URL |
| `data/profile.ts` | 461 | Content: hero copy, 12 types, projects, contact |

### Dead CSS in `globals.css` (no component uses these classes)

Sections to **delete** rather than rewrite. Before deleting, confirm each with
`grep -rn "<class>" components app/*.tsx lib data`. The screenshots then prove
nothing changed.

- Site menu (`.menu-*`, ~250 lines), unless the menu is wanted back
- Multitude detail pages (`.u-detail*`)
- Multitude layouts (`.m-*`: terminal, polaroid, recipe, rental, business…)
- Page-to-page portal (`.portal-x*`)
- Multitudes track (`.u-track*`, `.u-card`)
- About / Contact / Explore / Reviews / Templates (`.h-*`, `.t-*`, …)
- The hero's old arrival block (`.u-arrive*`, `.u-portal-copy`), which isn't rendered any more
- Unused assets to check: `public/wallpapers/paper.webp`, `studio-sm.webp`, `public/brand/ps-mark.png`

## Steps (in order, smallest risk first)

### 0. Setup
- Add `.visual/` to `.gitignore`.
- On the baseline commit, run `capture .visual/baseline`.
- Run the manual checklist once on the baseline, so there is a reference for how it should feel.

### 1. `lib/`: `prefs.ts`, `site.ts`
Same exports and same names (`PREFS_EVENT`, `motionReduced`, `prefsScript`, …).
`prefsScript` must produce the same `data-theme` / `data-text` / `data-motion` /
`data-lite` attributes before first paint.

### 2. `data/profile.ts`
Clean types (`WebsiteType`, `Multitude`, projects). Values are copied unchanged.

### 3. `components/MultitudeArt.tsx`
Same gradient / ink values and identical SVG paths (the icons are visible in the shots).

### 4. Shell: `layout.tsx`, `page.tsx`, `Cosmos.tsx`, `PrefsSync.tsx`

### 5. CSS restructure
Split `globals.css` into `app/styles/`: `tokens.css` (`:root` + light theme),
`base.css`, `cosmos.css`, `hero.css` (merge in the current hero.css; this also removes the
`.u-section` specificity workaround, since order is then controlled), and `showcase.css`.
Delete the dead sections listed above. Keep the cascade order so that each
selector ends up with the same final values. Compare after **each** file is moved,
because a cascade-order slip shows up as a small diff.

### 6. `components/MultitudesHero.tsx`
Split into:
- `lib/fitDot.ts`: the canvas tittle measurement, with the same fallback logic
- `useDive()`: measure / apply / tick / reset / intro (`INTRO_EVENT`, `data-drop`)
- `usePointerPolish()`: stage spotlight + card tilt
- `useIdleUpkeep()`: IntersectionObserver `data-offscreen` + sheen timer
- `HeroCard` component for the 13 cards (12 types + the 3D card)

Performance rules from the current comments that **must** survive:
- The world zoom is pure 2D transform: no `perspective`, `preserve-3d` or `will-change` on `.u-world` / `.u-camera`
- Measure geometry only when a glide starts / on resize / font load, never per frame
- Write styles only when a value changes (the `shown*` caches)
- The portal ring is re-drawn only every 8% of growth (`PORTAL_STEP`) and scaled on the compositor
- Hide (`visibility: hidden`) layers once they're fully faded, so they aren't rastered at 100×
- Look `#cosmos` up on use, not once (hot reload re-creates it)
- The IntersectionObserver reads the **last** entry

### 7. `components/Showcase3D.tsx`
Rewrite last (most timing-sensitive). Keep `STEP`, `WORDS`, `GAP`, `TUNNEL`,
`STREAKS`, `FRAMES`, `PIECES`, `BUILD`, `WALL`, the `monotone` curve and the
autoplay schedule. Run the full manual checklist after this step.

### 8. Final pass
`npx tsc`, `eslint`, `next build`, a full screenshot compare, the full manual checklist,
then replace the default create-next-app README with a short real one.

## Status

- [x] Hero polish committed as the baseline (`76959ab`)
- [x] Plan + `scripts/visual-check.mjs` committed
- [ ] Confirm visual-check is deterministic (capture twice on the baseline → compare must report "all shots match")
- [ ] 0. Setup (gitignore, baseline capture, manual baseline run)
- [ ] 1. lib/
- [ ] 2. data/profile.ts
- [ ] 3. MultitudeArt.tsx
- [ ] 4. Shell components
- [ ] 5. CSS restructure + dead CSS removal
- [ ] 6. MultitudesHero.tsx
- [ ] 7. Showcase3D.tsx
- [ ] 8. Final pass
