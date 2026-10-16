"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { INTRO_EVENT } from "@/components/MultitudesHero";
import { findType, profile } from "@/data/profile";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
// 0..1 across [a, b] of the section's progress.
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const sites = profile.projects.filter((p) => p.image).slice(0, 12);
const STEP = 360 / sites.length;

// Each word flies past with one of my websites of that kind beside it.
const WORDS = [
  { t: "Shops", c: "#d7ff3f", site: "Bazaarify" },
  { t: "Gyms", c: "#6e8cff", site: "IronForge Fitness" },
  { t: "Artists", c: "#ff6338", site: "Art by the Passenger" },
  { t: "Cafés", c: "#ffc53d", site: "Saffron Hearth" },
  { t: "Hotels", c: "#38e8ff", site: "Waypoint" },
  { t: "Clinics", c: "#ff4fa3", site: "Still Waters Therapy" },
  { t: "Your brand.", c: "#d7ff3f", site: "" },
].map((w) => ({ ...w, image: profile.projects.find((p) => p.title === w.site)?.image }));
const GAP = 1500; // px between words along the tunnel
// Ends with "Your brand." held just in front of the camera.
const TUNNEL = (WORDS.length - 1) * GAP + 450;
const wordZ = (i: number) => -i * GAP - 600;

// Seeded so the server and client draw the same field.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
// Light streaks along the tunnel walls (each one a thin bar lying along z).
const STREAKS = Array.from({ length: 44 }, () => {
  const a = rand() * Math.PI * 2;
  const r = 520 + rand() * 700;
  return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r * 0.62), z: Math.round(-rand() * (TUNNEL + 2600)), len: Math.round(200 + rand() * 600), c: ["#d7ff3f", "#6e8cff", "#ff6338", "#ffffff"][Math.floor(rand() * 4)] };
});
// Neon frames the camera flies through, each twisted a little further.
const FRAMES = Array.from({ length: 11 }, (_, i) => ({ z: Math.round(-i * (TUNNEL / 10)) - 300, c: WORDS[i % WORDS.length].c }));
// Scene 0: a website assembling in a browser. Wireframe pieces (as % of the
// page: left, top, width, height) fly in from a seeded scatter in 3D.
const BUILD_SHOT = profile.projects.find((p) => p.title === "Aangan Estates")?.image ?? sites[0].image!;
const URL_TEXT = "yourbrand.com";
const STEPS = ["Design", "Build", "Launch"];
const PIECES = [
  { k: "nav", l: 3, t: 4, w: 94, h: 8 },
  { k: "text", l: 5, t: 20, w: 46, h: 10 },
  { k: "text", l: 5, t: 33, w: 34, h: 10 },
  { k: "line", l: 5, t: 47, w: 38, h: 4 },
  { k: "button", l: 5, t: 56, w: 17, h: 8 },
  { k: "media", l: 56, t: 17, w: 39, h: 48 },
  { k: "card", l: 3, t: 72, w: 29, h: 22 },
  { k: "card", l: 35.5, t: 72, w: 29, h: 22 },
  { k: "card", l: 68, t: 72, w: 29, h: 22 },
].map((piece) => ({
  ...piece,
  x: Math.round((rand() - 0.5) * 1800),
  y: Math.round((rand() - 0.5) * 1000),
  z: Math.round(300 + rand() * 900),
  rx: Math.round((rand() - 0.5) * 140),
  ry: Math.round((rand() - 0.5) * 140),
}));
// The build takes the first part of the pinned scroll; the other three
// scenes share the rest exactly as before.
const BUILD = 0.165;
// The isometric wall: every screenshot twice, in four columns.
const WALL = [0, 1, 2, 3].map((c) => [...sites, ...sites].filter((_, i) => i % 4 === c));

// After the dive: one pinned stage, four 3D scenes scrubbed by scroll — a
// website assembling itself in a browser, a ring of my websites the camera
// flies through, a tunnel of the people I build for, then a tilted wall of
// work that settles behind the call to action.
// `?play` (or pressing P) auto-scrolls the whole page in ~27s for a recording.
export default function Showcase3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const playRef = useRef<() => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current!;
    const q = <T extends HTMLElement>(s: string) => section.querySelector<T>(s)!;
    const buildScene = q(".s-scene-build");
    const browser = q(".s-browser");
    const pieces = [...section.querySelectorAll<HTMLElement>(".s-piece")];
    const shot = q(".s-browser-shot");
    const scan = q(".s-scan");
    const url = q(".s-url-text");
    const steps = [...section.querySelectorAll<HTMLElement>(".s-steps span")];
    const stepsRow = q(".s-steps");
    let shownUrl = "";
    let shownStep = -1;
    const ring = q(".s-ring");
    const ringScene = q(".s-scene-ring");
    const ringTitle = q(".s-ring-title");
    const cards = [...section.querySelectorAll<HTMLElement>(".s-card")];
    const tunnel = q(".s-scene-tunnel");
    const tunnelCam = q(".s-tunnel-cam");
    const words = [...section.querySelectorAll<HTMLElement>(".s-word")];
    const streaks = [...section.querySelectorAll<HTMLElement>(".s-streak")];
    const frames = [...section.querySelectorAll<HTMLElement>(".s-frame")];
    const tiles = [...section.querySelectorAll<HTMLElement>(".s-fly")];
    const flash = q(".s-flash");
    let shownWord = -1;
    const tunnelKicker = q(".s-tunnel-kicker");
    const wallScene = q(".s-scene-wall");
    const wall = q(".s-wall");
    const dim = q(".s-dim");
    const cols = [...section.querySelectorAll<HTMLElement>(".s-col")];
    const cta = q(".s-cta");
    const bar = q<HTMLElement>(".s-bar i");
    const count = q(".s-count");

    let cur = 0;
    let target = 0;
    let frame = 0;
    let last = 0;
    let shownCount = "";

    // -1..0 while the stage slides up into view, then 0..1 while it's pinned.
    const progress = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top > 0) return -Math.min(1, r.top / vh);
      const travel = r.height - vh;
      return travel > 0 ? clamp01(-r.top / travel) : 0;
    };

    // Scene opacity, written only when it changes (and hidden at zero).
    const show = (el: HTMLElement, o: number) => {
      const v = o > 0.001 ? o.toFixed(3) : "0";
      if (el.style.opacity === v) return;
      el.style.opacity = v;
      el.style.visibility = v === "0" ? "hidden" : "";
    };
    // Same, for the many tunnel pieces: written only on change, and hidden
    // (so never rastered) whenever they're invisible.
    const fade = (el: HTMLElement, o: number) => {
      const v = o > 0.005 ? o.toFixed(2) : "0";
      if (el.style.opacity === v) return;
      el.style.opacity = v;
      el.style.visibility = v === "0" ? "hidden" : "";
    };

    const apply = () => {
      const p = cur;
      const arrive = 1 + Math.min(0, p); // 0..1 as the stage arrives
      const bp = clamp01(p / BUILD); // through the build
      const pp = clamp01((p - BUILD) / (1 - BUILD)); // through the other three
      // The ring rises in from below as the browser flies off the top.
      const enter = clamp01((p - BUILD * 0.8) / (BUILD * 0.2));

      // Scene 0: the website builds itself.
      const bIn = smooth(arrive);
      const bOut = smooth(seg(bp, 0.76, 0.98));
      show(buildScene, bIn * (1 - bOut));
      if (buildScene.style.visibility !== "hidden") {
        const settle = smooth(seg(bp, 0, 0.45));
        browser.style.transform = `translateY(${(1 - bIn) * 30 - bOut * 85}vh) translateZ(${(1 - bIn) * -1400 - bOut * 600}px) rotateX(${lerp(30, 8, settle) - bOut * 30}deg) rotateY(${lerp(-16, 7, bp)}deg) rotateZ(${(1 - bIn) * -5}deg)`;
        const shotT = smooth(seg(bp, 0.44, 0.62));
        pieces.forEach((el, i) => {
          const { x, y, z, rx, ry } = PIECES[i];
          const a = 0.03 + i * 0.032;
          const t = smooth(seg(bp, a, a + 0.17));
          const u = 1 - t;
          el.style.transform = `translate3d(${x * u}px, ${y * u}px, ${z * u}px) rotateX(${rx * u}deg) rotateY(${ry * u}deg)`;
          fade(el, shotT >= 1 ? 0 : 0.3 + 0.7 * t);
        });
        // The real site renders over the wireframe, top to bottom.
        show(shot, shotT);
        shot.style.clipPath = `inset(0 0 ${((1 - shotT) * 100).toFixed(2)}% 0)`;
        scan.style.top = `${(shotT * 100).toFixed(2)}%`;
        fade(scan, shotT > 0 && shotT < 1 ? 1 : 0);
        const typed = URL_TEXT.slice(0, Math.round(seg(bp, 0.6, 0.74) * URL_TEXT.length));
        if (typed !== shownUrl) url.textContent = shownUrl = typed;
        browser.toggleAttribute("data-live", bp > 0.76);
        const step = bp < 0.44 ? 0 : bp < 0.7 ? 1 : 2;
        if (step !== shownStep) {
          shownStep = step;
          steps.forEach((el, i) => el.toggleAttribute("data-on", i <= step));
        }
        stepsRow.style.opacity = (smooth(seg(arrive, 0.5, 1)) * (1 - smooth(seg(bp, 0.74, 0.86)))).toFixed(3);
      }

      // Scene 1: the ring.
      const rIn = smooth(enter);
      const rOut = smooth(seg(pp, 0.28, 0.35));
      const spin = -40 - pp * 820 - (1 - rIn) * 60;
      const tilt = lerp(26, 8, smooth(seg(pp, 0, 0.22))) - rOut * 8;
      show(ringScene, Math.min(rIn, 1 - smooth(seg(pp, 0.31, 0.35))));
      const ringOn = ringScene.style.visibility !== "hidden";
      if (ringOn) ring.style.transform = `translateY(${(1 - rIn) * 40}vh) translateZ(${rOut * 2400 - (1 - rIn) * 600}px) rotateX(${tilt}deg) rotateY(${spin}deg)`;
      if (ringOn) cards.forEach((c, i) => {
        // Dim the cards turned away from the camera.
        const a = ((i * STEP + spin) * Math.PI) / 180;
        c.style.opacity = (0.28 + 0.72 * ((Math.cos(a) + 1) / 2)).toFixed(3);
      });
      const tIn = smooth(seg(pp, 0.02, 0.1));
      const tOut = smooth(seg(pp, 0.22, 0.28));
      ringTitle.style.opacity = (tIn * (1 - tOut)).toFixed(3);
      ringTitle.style.transform = `translateZ(${(1 - tIn) * -400 + tOut * 500}px) rotateX(${(1 - tIn) * 40}deg)`;

      // Scene 2: flying through the words.
      const tp = seg(pp, 0.33, 0.68);
      const fly = smooth(tp) * TUNNEL;
      show(tunnel, smooth(seg(pp, 0.31, 0.36)) * (1 - smooth(seg(pp, 0.66, 0.71))));
      // Speed (0..1) from the eased curve's slope: the lens widens and the
      // camera banks harder the faster it goes.
      const speed = 6 * tp * (1 - tp) / 1.5;
      const roll = tp * -150;
      tunnelCam.style.transform = `translateZ(${fly}px) rotateZ(${roll}deg)`;
      const tunnelOn = tunnel.style.visibility !== "hidden";
      let near = -1;
      if (tunnelOn) {
        words.forEach((w, i) => {
          const z = wordZ(i) + fly; // where the word sits relative to the camera
          const o = z > 320 ? 0 : z > 0 ? 1 - z / 320 : clamp01(1 + z / (GAP * 0.8));
          fade(w, o);
          if (o === 0) return;
          // Stays upright against the camera roll, and swings round as it nears.
          const swing = clamp01(-z / 1500);
          w.style.transform = `translate3d(0, 0, ${wordZ(i)}px) rotateZ(${-roll - (i % 2 ? 6 : -6)}deg) rotateY(${(i % 2 ? 1 : -1) * swing * 70}deg) scale(${1 + clamp01(z / 320) * 0.4})`;
          if (z > -900 && z < 320) near = i;
        });
        tiles.forEach((t, i) => {
          const z = wordZ(i) - 250 + fly;
          fade(t, z > 500 ? 0 : clamp01(1 + z / (GAP * 1.1)));
        });
        frames.forEach((f, i) => {
          const z = FRAMES[i].z + fly;
          fade(f, z > 150 ? 0 : z > 0 ? 1 - z / 150 : clamp01(1 + z / 4200));
        });
        streaks.forEach((s, i) => {
          const z = STREAKS[i].z + fly;
          fade(s, z > 600 ? 0 : clamp01(1 + z / 3000) * (0.35 + speed * 0.65));
        });
      }
      // The whole frame washes in the colour of the word flying past.
      if (near !== shownWord) {
        shownWord = near;
        if (near >= 0) flash.style.setProperty("--c", WORDS[near].c);
        flash.toggleAttribute("data-on", near >= 0);
      }
      tunnelKicker.style.opacity = (smooth(seg(pp, 0.35, 0.39)) * (1 - smooth(seg(pp, 0.6, 0.64)))).toFixed(3);

      // Scene 3: the wall, then the call to action.
      const wIn = smooth(seg(pp, 0.66, 0.76));
      const settle = smooth(seg(pp, 0.84, 0.94));
      show(wallScene, wIn);
      if (wIn > 0) wall.style.transform = `translateZ(${(1 - wIn) * -1200 - settle * 500}px) rotateX(${lerp(80, 52, wIn)}deg) rotateZ(${lerp(-60, -32, wIn) + settle * 6}deg)`;
      dim.style.opacity = (settle * 0.62).toFixed(3);
      if (wIn > 0) cols.forEach((c, i) => {
        const dir = i % 2 ? 1 : -1;
        c.style.transform = `translateY(${dir * (pp - 0.66) * 120 - (i % 2 ? 40 : 0)}%)`;
      });
      const cIn = smooth(seg(pp, 0.86, 0.96));
      show(cta, cIn);
      cta.style.transform = `translateZ(${(1 - cIn) * -500}px) rotateX(${(1 - cIn) * -30}deg)`;
      cta.toggleAttribute("data-in", cIn > 0.5);

      bar.style.transform = `scaleX(${Math.max(0, p)})`;
      const n = p < BUILD ? "01" : pp < 0.34 ? "02" : pp < 0.68 ? "03" : "04";
      if (n !== shownCount) count.textContent = shownCount = n;
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      cur += (target - cur) * (1 - Math.exp(-dt / 140));
      if (Math.abs(target - cur) < 0.0001) cur = target;
      apply();
      if (cur === target) {
        frame = 0;
        last = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    const onScroll = () => {
      target = progress();
      if (!frame && target !== cur) frame = requestAnimationFrame(tick);
    };

    cur = target = progress();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Autoplay for the screen recording.
  useEffect(() => {
    let raf = 0;
    let run = 0; // bumped on every play/stop, so a stale start is dropped
    const html = document.documentElement;
    const stop = () => {
      run++;
      cancelAnimationFrame(raf);
      raf = 0;
      html.removeAttribute("data-autoplay");
    };
    const play = async () => {
      stop();
      const me = run;
      html.setAttribute("data-autoplay", "");
      // Decode every screenshot first, so none pops in or stalls a frame
      // mid-recording (capped, in case one never loads).
      const imgs = [...sectionRef.current!.querySelectorAll("img")];
      await Promise.race([Promise.all(imgs.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 2500))]);
      if (me !== run) return;
      const vh = window.innerHeight;
      const hero = document.querySelector<HTMLElement>(".u-section")!;
      const show = sectionRef.current!;
      // Where the hero's dive finishes (see MultitudesHero's onScroll).
      const diveEnd = hero.offsetTop + (hero.offsetHeight - vh) * 0.8;
      const top = show.offsetTop;
      const T = show.offsetHeight - vh;
      // [seconds, scrollY]: holds where two values match.
      // Where each of the last three scenes' marks sits in the pinned scroll.
      const at3 = (v: number) => top + (BUILD + v * (1 - BUILD)) * T;
      const keys: [number, number][] = [
        [0, 0],
        // Held while the hero drops in from above (the last card lands ~2.3s).
        [2.6, 0],
        // Past the dive's end the browser is still far off, so that stretch
        // is crossed quickly rather than held.
        [6, diveEnd + (top - diveEnd) * 0.2],
        [6.9, top],
        [10.6, top + BUILD * T],
        [15.2, at3(0.33)],
        [20, at3(0.68)],
        [22.8, at3(0.84)],
        [24.6, at3(1)],
        [27.5, at3(1)],
      ];
      const at = monotone(keys);
      window.scrollTo({ top: 0, behavior: "instant" });
      window.dispatchEvent(new Event(INTRO_EVENT));
      const t0 = performance.now();
      const step = (now: number) => {
        const t = (now - t0) / 1000;
        window.scrollTo({ top: at(t), behavior: "instant" });
        if (t < keys[keys.length - 1][0]) raf = requestAnimationFrame(step);
        else stop();
      };
      raf = requestAnimationFrame(step);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") play();
      if (e.key === "Escape") stop();
    };
    // Grabbing the wheel or touching the screen hands control back.
    const interrupt = () => raf && stop();
    playRef.current = play;
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    const auto = new URLSearchParams(location.search).has("play") ? window.setTimeout(play, 1200) : 0;
    return () => {
      clearTimeout(auto);
      stop();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
    };
  }, []);

  return (
    <>
    <button type="button" className="s-play" onClick={() => playRef.current()}>
      <span aria-hidden>▶</span> Auto play
    </button>
    <section ref={sectionRef} id="showcase" className="s-section" aria-label="Selected work">
      <div className="s-stage">
        {/* 0 · A website builds itself */}
        <div className="s-scene s-scene-build" aria-hidden>
          <p className="s-steps">
            {STEPS.map((step, i) => (
              <span key={step}>
                <b>{String(i + 1).padStart(2, "0")}</b> {step}
              </span>
            ))}
          </p>
          <div className="s-browser">
            <div className="s-browser-bar">
              <i />
              <i />
              <i />
              <span className="s-url">
                <span className="s-url-lock">●</span>
                <span className="s-url-text" />
                <span className="s-url-caret" />
              </span>
              <span className="s-url-live">Live</span>
            </div>
            <div className="s-browser-body">
              {PIECES.map((piece, i) => (
                <i
                  key={i}
                  className={`s-piece s-piece-${piece.k}`}
                  style={{ left: `${piece.l}%`, top: `${piece.t}%`, width: `${piece.w}%`, height: `${piece.h}%` }}
                />
              ))}
              <div className="s-browser-shot">
                <Image src={BUILD_SHOT} alt="" fill loading="eager" sizes="60vw" className="object-cover object-top" />
              </div>
              <i className="s-scan" />
            </div>
          </div>
        </div>

        {/* 1 · Ring of websites */}
        <div className="s-scene s-scene-ring">
          <div className="s-ring-title">
            <p className="s-kicker">Selected work</p>
            <h2>
              Real businesses,
              <br />
              <em>real websites.</em>
            </h2>
          </div>
          <div className="s-ring">
            {sites.map((p, i) => (
              <figure key={p.title} className="s-card" style={{ "--a": `${i * STEP}deg`, "--c": p.color } as CSSProperties}>
                <div className="s-shot">
                  <Image src={p.image!} alt="" fill loading="eager" sizes="(min-width: 800px) 22vw, 50vw" className="object-cover object-top" />
                </div>
                <figcaption>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <strong>{p.title}</strong>
                  <small>{findType(p.multitude)?.title}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* 2 · Word tunnel */}
        <div className="s-scene s-scene-tunnel" aria-hidden>
          <div className="s-flash" />
          <p className="s-tunnel-kicker">Websites for</p>
          <div className="s-tunnel-cam">
            {FRAMES.map((f, i) => (
              <i key={i} className="s-frame" style={{ "--c": f.c, transform: `translate3d(0, 0, ${f.z}px) rotateZ(${i * 11}deg)` } as CSSProperties} />
            ))}
            {STREAKS.map((s, i) => (
              <i key={i} className="s-streak" style={{ "--c": s.c, width: s.len, transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotateY(90deg)` } as CSSProperties} />
            ))}
            {WORDS.map((w, i) =>
              w.image ? (
                <div
                  key={w.t}
                  className="s-fly"
                  style={{ "--c": w.c, transform: `translate3d(${i % 2 ? -560 : 560}px, ${i % 3 ? 140 : -160}px, ${wordZ(i) - 250}px) rotateY(${i % 2 ? 32 : -32}deg) rotateZ(${i % 2 ? 4 : -4}deg)` } as CSSProperties}
                >
                  <Image src={w.image} alt="" fill loading="eager" sizes="520px" className="object-cover object-top" />
                </div>
              ) : null,
            )}
            {WORDS.map((w, i) => (
              <span
                key={w.t}
                className="s-word"
                style={{ "--c": w.c, transform: `translate3d(0, 0, ${wordZ(i)}px)` } as CSSProperties}
              >
                {w.t}
              </span>
            ))}
          </div>
        </div>

        {/* 3 · Isometric wall + CTA */}
        <div className="s-scene s-scene-wall">
          <div className="s-wall" aria-hidden>
            {WALL.map((col, c) => (
              <div key={c} className="s-col">
                {[...col, ...col].map((p, i) => (
                  <div key={i} className="s-tile" style={{ "--c": p.color } as CSSProperties}>
                    <Image src={p.image!} alt="" fill loading="eager" sizes="(min-width: 800px) 22vw, 40vw" className="object-cover object-top" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="s-dim" aria-hidden />
          <div className="s-cta">
            <p className="s-kicker">
              <i className="u-live" aria-hidden /> Open for new projects
            </p>
            <h2>
              Your website,
              <br />
              <em>next.</em>
            </h2>
            <div className="s-cta-row">
              <a href={`mailto:${profile.contact.email}`} className="u-cta-primary s-btn">
                Let&apos;s build it <span aria-hidden>→</span>
              </a>
              <a href={`mailto:${profile.contact.email}`} className="u-cta-ghost s-btn">
                {profile.contact.email}
              </a>
            </div>
          </div>
        </div>

        <div className="s-hud" aria-hidden>
          <span>
            <span className="s-count">01</span> / 04
          </span>
          <span className="s-bar">
            <i />
          </span>
          <span>{profile.brand}</span>
        </div>
      </div>
    </section>
    </>
  );
}

// Monotone cubic (Fritsch–Carlson) through the keyframes: smooth velocity, no
// overshoot, and a full stop on every hold.
function monotone(k: [number, number][]) {
  const n = k.length;
  const d = k.slice(1).map(([t, y], i) => (y - k[i][1]) / (t - k[i][0]));
  const m = k.map((_, i) => {
    if (i === 0 || i === n - 1) return 0;
    const a = d[i - 1];
    const b = d[i];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  // Harmonic-mean tangents (above), clamped for monotonicity.
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = (3 / h) * a * d[i];
      m[i + 1] = (3 / h) * b * d[i];
    }
  }
  return (t: number) => {
    if (t <= k[0][0]) return k[0][1];
    if (t >= k[n - 1][0]) return k[n - 1][1];
    let i = 0;
    while (t > k[i + 1][0]) i++;
    const h = k[i + 1][0] - k[i][0];
    const s = (t - k[i][0]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * k[i][1] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * k[i + 1][1] + (s3 - s2) * h * m[i + 1];
  };
}
