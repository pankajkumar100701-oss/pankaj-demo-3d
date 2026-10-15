"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { profile } from "@/data/profile";
import { motionReduced, PREFS_EVENT } from "@/lib/prefs";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

const PORTAL_STEP = Math.log(1.08); // the dive's ring is re-drawn every 8% of growth

// Places the dot exactly where the rendered font draws its tittle. The serif
// (or its fallback, while it loads) can vary, so its "i" is drawn to a canvas
// and diffed against its dotless "ı" — whatever is left over is the tittle.
function fitDot(span: HTMLElement, dot: HTMLElement) {
  const S = 200;
  const cs = getComputedStyle(span);
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.canvas.width = ctx.canvas.height = S * 2;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${S}px ${cs.fontFamily}`;
  const x0 = S / 2;
  const y0 = S * 1.4;
  const draw = (ch: string) => {
    ctx.clearRect(0, 0, S * 2, S * 2);
    ctx.fillText(ch, x0, y0);
    return ctx.getImageData(0, 0, S * 2, S * 2).data;
  };
  const dotted = draw("i");
  const dotless = draw("ı");
  // Only look above the dotless stem: some fonts draw the two stems slightly
  // differently, and those slivers aren't part of the tittle.
  let stemTop = 0;
  while (stemTop < S * 2 && !dotless.slice(stemTop * S * 8, (stemTop + 1) * S * 8).some((v, k) => k % 4 === 3 && v > 128)) stemTop++;
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < stemTop - 1; y++) {
    for (let x = 0; x < S * 2; x++) {
      const a = (y * S * 2 + x) * 4 + 3;
      if (dotted[a] > 128 && dotless[a] < 32) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  // The inline span's box starts at the glyph origin and its top sits one
  // font ascent above the baseline.
  const ascent = ctx.measureText("ı").fontBoundingBoxAscent;
  if (maxX < 0) {
    // No readable pixels (canvas readback blocked or noised by the browser):
    // fall back to text metrics, which still give the tittle's top and right
    // edge, and size it from the gap down to the dotless stem.
    const mi = ctx.measureText("i");
    const md = ctx.measureText("ı");
    const top = mi.actualBoundingBoxAscent;
    const gap = top - md.actualBoundingBoxAscent;
    if (!(gap > 0)) return; // Metrics unusable too: keep the CSS default.
    const size = gap * 0.51;
    minX = mi.actualBoundingBoxRight - size + x0;
    maxX = minX + size - 1;
    minY = y0 - top;
    maxY = minY + size - 1;
  }
  const size = Math.max(maxX - minX, maxY - minY) + 1;
  const cx = (minX + maxX + 1) / 2 - x0;
  const cy = (minY + maxY + 1) / 2 - (y0 - ascent);
  // Exactly where the font draws its own tittle, so it reads as a plain "i".
  dot.style.left = `${(cx - size / 2) / S}em`;
  dot.style.top = `${(cy - size / 2) / S}em`;
  dot.style.width = dot.style.height = `${size / S}em`;
}

// Scroll-driven dive into the dot of the "i": the stage stays pinned while you
// scroll through the section, the camera centres on the dot and zooms into it
// exponentially (constant perceived speed). The dot is handed off to a portal
// disk that hollows out into a ring, punching a hole through the hero to the
// cosmos behind it — the rest of the site lives inside the dot. Desktop +
// motion-allowed only; elsewhere it's static.
//
// Everything is a 2D transform on purpose: anything under a CSS perspective is
// rastered at 1× and stretched, which pixelates the type.
export default function MultitudesHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const scene = sceneRef.current!;
    const world = worldRef.current!;
    const dot = dotRef.current!;
    const portal = portalRef.current!;
    const readout = readoutRef.current!;
    const nodes = world.querySelector<HTMLElement>(".u-nodes")!;
    const outsideEls = stage.querySelectorAll<HTMLElement>(".u-vignette, .u-bottom");
    // Everything that clears out early (cards, glow, orbits, micro labels):
    // once invisible it's hidden too, so it isn't re-rastered at huge scale.
    // The logo mark and the studio photo behind the hero go with them, so the
    // hole opens onto the cosmos (and the mark isn't rastered at 100×).
    const early = [nodes, ...world.querySelectorAll<HTMLElement>(".u-halo, .u-orbit, .u-micro, .u-mark"), ...scene.querySelectorAll<HTMLElement>(".u-photo")];
    // The fixed backdrop layer behind the page (Cosmos). The dive's hole is
    // this layer clipped to a circle; the hero itself has no backdrop here.
    // Looked up on use, not captured: the layer can be re-created (e.g. by a
    // hot reload) after this effect runs, and a stale node means no hole.
    const clipCosmos = (v: string) => {
      const el = document.getElementById("cosmos");
      if (el && el.style.clipPath !== v) el.style.clipPath = v;
    };

    const wide = window.matchMedia("(min-width: 800px)");
    
    // Dot geometry. Measured when a glide starts and on resize / font load —
    // not every frame, since forcing layout per frame is what made the dive
    // stutter on slower machines. The world's transform is cleared for the
    // read (and restored) so the rects are untransformed and sub-pixel exact
    // (offset* rounding would drift visibly at 100× zoom).
    let ox = 0; // dot centre in world coords
    let oy = 0;
    let rx = 0; // dot centre in stage coords at rest
    let ry = 0;
    let r0 = 1; // dot radius
    let sw = 0; // stage size
    let sh = 0;
    let maxZoom = 100;
    const measure = () => {
      const prev = world.style.transform;
      world.style.transform = "none";
      const s = stage.getBoundingClientRect();
      const w = world.getBoundingClientRect();
      const d = dot.getBoundingClientRect();
      world.style.transform = prev;
      sw = s.width;
      sh = s.height;
      r0 = d.width / 2 || 1;
      ox = d.left + r0 - w.left;
      oy = d.top + r0 - w.top;
      rx = w.left - s.left + ox;
      ry = w.top - s.top + oy;
      // Big enough that the dot covers the stage's corners from its centre.
      maxZoom = (Math.hypot(sw, sh) / 2 / r0) * 1.08;
      world.style.transformOrigin = `${ox}px ${oy}px`;
    };

    let cur = 0; // eased dive progress, 0..1
    let target = 0;
    let frame = 0;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? clamp01(-rect.top / travel) : 0;
    };

    let shownReadout = "";
    let shownFade = 1;
    let shownInside = -1;
    let shownClear = -1;
    let shownHandedOff: boolean | null = null;
    const apply = () => {
      const zoom = Math.pow(maxZoom, cur);
      // Glide the dot to the centre of the frame early in the dive.
      const pan = smooth(clamp01(cur / 0.45));
      const px = (sw / 2 - rx) * pan;
      const py = (sh / 2 - ry) * pan;
      world.style.transform = `translate(${px}px, ${py}px) scale(${zoom}) rotate(${cur * -7}deg)`;
      // The cards rush past and clear out of the way first.
      const clear = clamp01(1 - (zoom - 1) / 1.6);
      if (clear !== shownClear) {
        shownClear = clear;
        for (const el of early) {
          el.style.opacity = clear < 1 ? String(clear) : "";
          el.style.visibility = clear > 0 ? "" : "hidden";
        }
      }
      // The portal is the dot (same colour, centre and radius), so the hand-off
      // is invisible. As it grows it hollows out from the centre into a thin
      // ring, and the hero is masked away inside it to reveal the cosmos.
      const x = rx + px;
      const y = ry + py;
      const r = r0 * zoom;
      const hollow = smooth(clamp01((zoom - 5) / 30));
      const handedOff = zoom > 3;
      if (handedOff !== shownHandedOff) {
        shownHandedOff = handedOff;
        portal.style.opacity = handedOff ? "1" : "0";
        dot.style.visibility = handedOff ? "hidden" : "";
      }
      // A bordered circle, drawn at a size that only steps every ~8% and scaled
      // to the exact radius on the compositor. Resizing it every frame meant
      // re-rastering a ring up to ~1800px across each frame (the late-dive lag);
      // now it's re-drawn a couple of dozen times over the whole dive.
      const size = Math.exp(Math.round(Math.log(Math.max(r, 1)) / PORTAL_STEP) * PORTAL_STEP);
      const s = r / size;
      const border = Math.round(((r - Math.max(0, Math.min(r * hollow, r - 1.5))) / s) * 4) / 4;
      // The hole matches the ring's drawn inner edge, not the ideal one.
      const inner = Math.max(0, r - border * s);
      const w = `${2 * size}px`;
      if (portal.style.width !== w) portal.style.width = portal.style.height = w;
      const bw = `${border}px`;
      if (portal.style.borderWidth !== bw) portal.style.borderWidth = bw;
      portal.style.transform = `translate(${x - r}px, ${y - r}px) scale(${s})`;
      // Past ~10x the title and orbits are only giant fragments sliding off
      // screen, yet rastering them at that size every frame stalled the dive
      // for 100-250ms. Fade the world out as it rushes past (like the cards;
      // the portal has long since taken over the dot) and stop painting it.
      const fade = clamp01(1 - (zoom - 4) / 7);
      if (fade !== shownFade) {
        shownFade = fade;
        world.style.opacity = fade < 1 ? String(fade) : "";
        world.style.visibility = fade > 0 ? "" : "hidden";
      }
      // Once the hole covers the frame there's nothing left to paint (and no
      // reason to keep rastering glyphs at 100×+).
      const covered = inner > Math.hypot(sw, sh) / 2 + 2;
      if (covered !== (scene.style.visibility === "hidden")) scene.style.visibility = covered ? "hidden" : "";
      clipCosmos(covered ? "" : `circle(${inner.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`);
      // The bottom bar and vignette clear out as the hole fills the frame;
      // the 3D showcase (Showcase3D) takes over from there.
      const inside = smooth(clamp01((cur - 0.86) / 0.12));
      if (inside !== shownInside) {
        shownInside = inside;
        for (const el of outsideEls) el.style.opacity = (1 - inside).toFixed(3);
      }
      const text = `Zoom ${zoom < 10 ? zoom.toFixed(2) : zoom.toFixed(0)}×`;
      if (text !== shownReadout) readout.textContent = shownReadout = text;
    };

    const reset = () => {
      world.style.transform = "";
      world.style.transformOrigin = "";
      for (const el of early) {
        el.style.opacity = "";
        el.style.visibility = "";
      }
      world.style.opacity = "";
      world.style.visibility = "";
      shownFade = 1;
      shownClear = -1;
      shownHandedOff = null;
      dot.style.visibility = "";
      portal.style.opacity = "";
      scene.style.visibility = "";
      for (const v of ["width", "height", "border-width", "transform"]) portal.style.removeProperty(v);
      clipCosmos("");
      for (const el of outsideEls) el.style.removeProperty("opacity");
      shownInside = -1;
      section.removeAttribute("data-zooming");
    };

    // Time-based easing so the glide feels the same at 60Hz and 120Hz+, and a
    // dropped frame catches up instead of stuttering.
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      cur += (target - cur) * (1 - Math.exp(-dt / 170));
      if (Math.abs(target - cur) < 0.0002) cur = target;
      apply();
      // Backdrop blur re-samples every frame under a moving transform; drop it
      // mid-dive (it's invisible over the dark stage anyway).
      // (Only on change: re-setting it every frame re-matched its selectors.)
      const zooming = cur > 0.001;
      if (zooming !== section.hasAttribute("data-zooming")) section.toggleAttribute("data-zooming", zooming);
      if (cur === target) {
        frame = 0;
        last = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (!wide.matches || motionReduced()) return;
      // The dive ends ~80% through; the showcase overlaps the rest and rises in.
      target = clamp01((progress() - 0.03) / 0.77);
      if (!frame && target !== cur) {
        measure();
        frame = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      if (!wide.matches || motionReduced()) return;
      measure();
      apply();
      onScroll();
    };

    const onModeChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      cur = target = 0;
      if (wide.matches && !motionReduced()) {
        measure();
        apply();
        onScroll();
      } else {
        reset();
      }
    };

    let alive = true;
    const fit = () => {
      fitDot(dot.parentElement!, dot);
      onResize();
    };
    fit();
    onModeChange();
    // Web fonts can shift the glyphs after first paint; re-fit once settled,
    // and re-measure once the intro animations have moved the title into place.
    document.fonts?.ready.then(() => alive && fit());
    // The title is sized in rem: the "Large text" setting moves the dot
    // without a window resize, so re-fit whenever the copy block changes size.
    const ro = new ResizeObserver(fit);
    ro.observe(world.querySelector(".u-copy")!);
    // (The title's periodic sheen ends here too; it doesn't move anything.)
    const onAnimEnd = (e: AnimationEvent) => {
      if (e.animationName !== "u-sheen") onResize();
    };
    world.addEventListener("animationend", onAnimEnd);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    wide.addEventListener("change", onModeChange);
    window.addEventListener(PREFS_EVENT, onModeChange);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      world.removeEventListener("animationend", onAnimEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      wide.removeEventListener("change", onModeChange);
      window.removeEventListener(PREFS_EVENT, onModeChange);
      clipCosmos("");
    };
  }, []);

  // Pointer polish (fine pointers only): a stage spotlight, plus each card's
  // glow position and a spring tilt toward the cursor.
  useEffect(() => {
    const stage = stageRef.current!;
    const spot = spotRef.current!;
    const cards = [...stage.querySelectorAll<HTMLElement>(".u-node > *")];
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    
    const onStageMove = (e: PointerEvent) => {
      if (!fine.matches) return;
      const r = stage.getBoundingClientRect();
      spot.style.translate = `${e.clientX - r.left}px ${e.clientY - r.top}px`;
    };
    const onCardMove = (e: PointerEvent) => {
      if (!fine.matches) return;
      const card = e.currentTarget as HTMLElement;
      const r = card.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      if (motionReduced()) return;
      card.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    };
    const onCardLeave = (e: PointerEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    };

    stage.addEventListener("pointermove", onStageMove);
    for (const c of cards) {
      c.addEventListener("pointermove", onCardMove);
      c.addEventListener("pointerleave", onCardLeave);
    }
    return () => {
      stage.removeEventListener("pointermove", onStageMove);
      for (const c of cards) {
        c.removeEventListener("pointermove", onCardMove);
        c.removeEventListener("pointerleave", onCardLeave);
      }
    };
  }, []);

  // Idle upkeep: pause the hero's loops while it's scrolled out of view, and
  // run the title's sheen as one sweep every few seconds rather than an
  // endless animation (see the CSS for why).
  useEffect(() => {
    const section = sectionRef.current!;
    const em = section.querySelector<HTMLElement>(".u-copy h1 em");
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      section.toggleAttribute("data-offscreen", !visible);
    });
    io.observe(section);
    const sweep = () => {
      if (!em || !visible || motionReduced() || section.hasAttribute("data-zooming")) return;
      em.setAttribute("data-sheen", "");
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "u-sheen") em?.removeAttribute("data-sheen");
    };
    em?.addEventListener("animationend", onEnd);
    let timer = 0;
    const first = window.setTimeout(() => {
      sweep();
      timer = window.setInterval(sweep, 7000);
    }, 5450);
    return () => {
      io.disconnect();
      em?.removeEventListener("animationend", onEnd);
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const { hero, multitudes } = profile;
  // Swap the accent's first "i" for a dotless "ı" plus a real dot element, so
  // the dot can be measured and dived into.
  const iAt = hero.accent.indexOf("i");
  // The websites I've built (the trending ones, as pills), then the way into every website type
  // (/explore): under the title on phones (so it's on the first screen), in
  // the bottom bar on desktop (where the cards leave no room under the title).
  // The list hides until profile.trendingSites names a project.
  // Only the trending websites (profile.trendingSites, max 5) show here.
  const trendingSites = profile.trendingSites
    .map((title) => profile.projects.find((p) => p.title === title))
    .filter((p) => p !== undefined)
    .slice(0, 5);
  const sites = (
    <>
      {trendingSites.length > 0 && (
        <>
          <span>Websites I&apos;ve built</span>
          <ul>
            {trendingSites.map((p) => (
              <li key={p.title} style={{ "--c": p.color } as CSSProperties}>
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link prefetch={false} href="/explore" className="u-sites-explore">
        Explore your type <span aria-hidden>→</span>
      </Link>
    </>
  );

  return (
    <section ref={sectionRef} className="u-section" aria-label="Introduction">
      <div ref={stageRef} className="u-stage">
        <div ref={spotRef} className="u-spot" aria-hidden />
        <div ref={sceneRef} className="u-scene">
          <div className="u-photo" aria-hidden />
          <div className="u-grain" aria-hidden />
          <div className="u-orb u-orb-a" aria-hidden />
          <div className="u-orb u-orb-b" aria-hidden />
          <div className="u-orb u-orb-c" aria-hidden />

          <div className="u-camera">
            <div ref={worldRef} className="u-world">
              <div className="u-halo" aria-hidden />
              <div className="u-orbit u-orbit-1" aria-hidden />
              <div className="u-orbit u-orbit-2" aria-hidden />
              <div className="u-orbit u-orbit-3" aria-hidden />

              <div className="u-copy">
                <p className="u-eyebrow">{hero.eyebrow}</p>
                <h1>
                  {/* What Google and screen readers get: the visual title spells
                      "Studio" with a dotless ı plus a separate dot element. */}
                  <span className="sr-only">
                    {hero.first} {hero.accent}
                  </span>
                  {/* The Pankaj Studio mark, in front of the name. */}
                  <span className="u-mark" aria-hidden />
                  <span aria-hidden>
                    {hero.first}
                    <br />
                    <em>
                      {iAt < 0 ? (
                        hero.accent
                      ) : (
                        <>
                          {hero.accent.slice(0, iAt)}
                          <span className="u-i">
                            ı<i ref={dotRef} className="u-dot" aria-hidden />
                          </span>
                          {hero.accent.slice(iAt + 1)}
                        </>
                      )}
                    </em>
                  </span>
                </h1>
                <p className="u-subline">{hero.subline}</p>
                {/* Phones: my websites and "Explore your type" sit under the title (desktop has them in the bottom bar). */}
                <div className="u-sites u-sites-mobile">{sites}</div>
              </div>

              <ul className="u-nodes">
                {multitudes.map((m, i) => {
                  const style = { "--x": `${m.x}%`, "--y": `${m.y}%`, "--c": m.color, "--i": i, ...artVars(m.slug, m.color) } as CSSProperties;
                  return (
                    <li key={m.n} className="u-node" style={style}>
                      <Link prefetch={false} href={`/websites/${m.slug}`}>
                        {/* Hover floods the card with its gradient and draws its icon. */}
                        <span className="u-node-flood" aria-hidden />
                        <span className="u-node-icon" aria-hidden>
                          <ArtIcon icon={artIcon(m.slug)} />
                        </span>
                        <b>{m.n}</b>
                        <strong>{m.title}</strong>
                        <small>{m.sub}</small>
                      </Link>
                    </li>
                  );
                })}
                {/* Not a business type: my 3D / WebGL demos, under Coaching / Education. */}
                <li className="u-node u-node-3d" style={{ "--x": "4%", "--y": "82%", "--c": "var(--m-blue)", "--i": multitudes.length, ...artVars("3d", "var(--m-blue)") } as CSSProperties}>
                  <Link prefetch={false} href="/templates">
                    <span className="u-node-flood" aria-hidden />
                    <span className="u-node-icon" aria-hidden>
                      <ArtIcon icon={artIcon("3d")} />
                    </span>
                    <b>13</b>
                    <strong>3D Websites</strong>
                    <small>WebGL / Motion / Live demos</small>
                  </Link>
                </li>
              </ul>

              {/* Phones skip the dive, so the arrival's call to action lives here
                  ("Explore your type" is already under the title). */}
              <div className="u-mobile-cta">
                <Link prefetch={false} href="/contact" className="u-cta-primary">
                  Customise your website plan <span aria-hidden>→</span>
                </Link>
                <a href={`mailto:${profile.contact.email}`} className="u-cta-ghost">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="u-mail" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
                  </svg> Email me
                </a>
                <p className="u-open">
                  <i className="u-live" aria-hidden /> Open for new projects
                </p>
              </div>

              <span className="u-micro u-m1" aria-hidden>CREATIVE</span>
              <span className="u-micro u-m2" aria-hidden>CURIOUS</span>
              <span className="u-micro u-m3" aria-hidden>BUILDING</span>
            </div>
          </div>
        </div>

        <div ref={portalRef} className="u-portal" aria-hidden />
        <div className="u-bottom">
          <span>
            <span className="u-wheel" aria-hidden>↕</span> Scroll to dive into the i
          </span>
          <div className="u-sites">{sites}</div>
          <span ref={readoutRef} className="u-readout" aria-hidden>
            Zoom 1.00×
          </span>
        </div>
        <div className="u-vignette" aria-hidden />
      </div>
    </section>
  );
}
