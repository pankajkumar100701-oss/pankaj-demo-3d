"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArtIcon, DEFAULT_ART, MULTITUDE_ART } from "@/components/MultitudeArt";
import { allTypes } from "@/data/profile";
import { motionReduced } from "@/lib/prefs";

const ENTER = 720; // ms: the disk floods the screen
const EXIT = 850; // ms: the new page opens out of its centre

// The page-to-page version of the hero's dive. Clicking any link to a
// multitude grows a disk in that multitude's own gradient out of the click
// (its "dot"), draws its icon and names the page, navigates underneath, then hollows out from the
// centre into an ever-wider ring that opens onto the new page. Lives in the
// root layout so it survives the navigation. Skipped for reduced motion,
// modified clicks and back/forward.
export default function PortalTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const exitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = rootRef.current!;
    const label = root.querySelector<HTMLElement>(".portal-x-label")!;
    let safety = 0;
    let go = 0;

    const finish = () => {
      root.removeAttribute("data-on");
      for (const a of [...root.getAnimations(), ...label.getAnimations()]) a.cancel();
      busy.current = false;
      pending.current = null;
    };

    exitRef.current = () => {
      clearTimeout(safety);
      const d = Math.hypot(innerWidth, innerHeight) + 4;
      label.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(1.06)" }], { duration: 260, fill: "forwards", easing: "ease-in" });
      // A full-screen layer minus a circle (mask exclude) whose size grows:
      // the colour hollows into a ring that sweeps off the edges.
      root
        .animate([{ maskSize: "0px 0px, 100% 100%" }, { maskSize: `${d}px ${d}px, 100% 100%` }], {
          duration: EXIT,
          delay: 140,
          easing: "cubic-bezier(0.65, 0, 0.2, 1)",
          fill: "forwards",
        })
        .finished.then(finish, finish);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="/websites/"]');
      // Links inside an open pop-up just navigate: the dialog would cover the disk.
      if (!a || (a.target && a.target !== "_self") || a.closest("dialog[open]")) return;
      const href = a.getAttribute("href")!.split(/[?#]/)[0];
      const m = allTypes.find((x) => href === `/websites/${x.slug}`);
      if (!m || href === location.pathname) return;
      // Phones get a plain page change: no animation there.
      if (motionReduced() || !window.matchMedia("(min-width: 800px)").matches) return;
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;

      // Grow from the click; keyboard "clicks" have no pointer, so use the link.
      let x = e.clientX;
      let y = e.clientY;
      if (!e.detail) {
        const r = a.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2;

      const art = MULTITUDE_ART[m.slug];
      root.style.setProperty("--from", art?.from ?? m.color);
      root.style.setProperty("--to", art?.to ?? m.color);
      root.style.setProperty("--art-ink", (art ?? DEFAULT_ART).ink);
      setSlug(m.slug);
      root.setAttribute("data-on", "");
      root.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${reach}px at ${x}px ${y}px)` }], {
        duration: ENTER,
        easing: "cubic-bezier(0.7, 0, 0.25, 1)",
        fill: "forwards",
      });
      label.animate([{ opacity: 0, transform: "translateY(1.5rem) scale(0.96)" }, { opacity: 1, transform: "none" }], {
        duration: 480,
        delay: ENTER * 0.45,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "both",
      });
      go = window.setTimeout(() => {
        go = 0;
        pending.current = href;
        router.push(href);
        // If the new page never shows up, don't leave the screen covered.
        safety = window.setTimeout(() => exitRef.current(), 4000);
      }, ENTER);
    };

    // Back pressed while the disk is still growing: cancel the trip.
    const onPop = () => {
      if (!go) return;
      clearTimeout(go);
      go = 0;
      finish();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clearTimeout(safety);
      clearTimeout(go);
    };
  }, [router]);

  // The new page has rendered under the cover: open it up.
  useEffect(() => {
    if (!pending.current || pathname !== pending.current) return;
    pending.current = null;
    requestAnimationFrame(() => requestAnimationFrame(() => exitRef.current()));
  }, [pathname]);

  const m = allTypes.find((x) => x.slug === slug);
  const icon = slug ? (MULTITUDE_ART[slug] ?? DEFAULT_ART).icon : null;
  return (
    <div ref={rootRef} className="portal-x" aria-hidden>
      {/* A huge, faint, slowly turning copy of the icon behind everything. */}
      {icon && <ArtIcon key={`mark-${slug}`} icon={icon} className="portal-x-mark" />}
      <div className="portal-x-label">
        {icon && (
          <span key={`icon-${slug}`} className="portal-x-icon">
            <ArtIcon icon={icon} />
          </span>
        )}
        <b>{m?.n}</b>
        <strong>{m?.title}</strong>
        <small>{m?.sub}</small>
      </div>
    </div>
  );
}
