"use client";

import { useEffect } from "react";
import { LITE_KEY, motionChosen } from "@/lib/prefs";

const SAMPLE_MS = 1500;
const MAX_PROBES = 6;

// Watches the frame rate for a moment after load and while scrolling (when the
// dive and the card row are animating). If this machine can't keep up, it
// sets <html data-lite>, which switches off the purely decorative idle loops
// (drifting glows, floating cards, grain, cursor light; see globals.css) so
// the scroll animations get the whole frame budget. Layout and the animations
// themselves stay the same. Remembered for the tab's session.
export default function PerfGuard() {
  useEffect(() => {
    const html = document.documentElement;
    // Already lite, or the viewer picked a motion level in the menu.
    if (html.hasAttribute("data-lite") || motionChosen()) return;

    const enable = () => {
      html.setAttribute("data-lite", "");
      try {
        sessionStorage.setItem(LITE_KEY, "1");
      } catch {}
    };
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2) return enable();

    let probes = 0;
    let frame = 0;
    let done = false;
    const probe = () => {
      if (frame || done || probes >= MAX_PROBES || document.hidden) return;
      probes++;
      const deltas: number[] = [];
      let start = 0;
      let last = 0;
      const tick = (now: number) => {
        if (!start) start = now;
        else deltas.push(now - last);
        last = now;
        if (now - start < SAMPLE_MS) {
          frame = requestAnimationFrame(tick);
          return;
        }
        frame = 0;
        // Slow if a third of the frames miss ~40fps, or the median does.
        const slow = deltas.filter((d) => d > 25).length;
        const median = [...deltas].sort((a, b) => a - b)[deltas.length >> 1] ?? 0;
        if (deltas.length > 10 && (slow / deltas.length > 0.33 || median > 22)) {
          done = true;
          enable();
          window.removeEventListener("scroll", probe);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    const first = window.setTimeout(probe, 800);
    window.addEventListener("scroll", probe, { passive: true });
    return () => {
      clearTimeout(first);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", probe);
    };
  }, []);
  return null;
}
