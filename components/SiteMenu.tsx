"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { findType, profile } from "@/data/profile";
import { DEFAULT_PREFS, measureFps, motionChosen, readPrefs, savePrefs, type Prefs } from "@/lib/prefs";

// Small line icons for the menu (24×24, stroked like ArtIcon).
const I = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 12.5 9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  ),
  pin: <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3zM12 14v6" />,
  chat2: <path d="M4 5h16v11H9l-5 4z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  text: <path d="M4 18 8.5 6l4.5 12M5.7 14h5.6M15 18l3-8 3 8M15.8 16h4.4" />,
  motion: <path d="M3 12c3-6 6-6 9 0s6 6 9 0" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  // Speedometers for the Motion levels: needle low, middle, high.
  gauge: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l3-5" />
      <circle cx="12" cy="17" r="1" />
    </>
  ),
  gaugeLow: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17 7.5 13.5" />
    </>
  ),
  gaugeMid: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17V11" />
    </>
  ),
  gaugeHigh: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l4.5-3.5" />
    </>
  ),
  flame: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5.5 1 1.5 2 2 2 2S10 6 12 3z" />,
};
const Icon = ({ d }: { d: ReactNode }) => <ArtIcon icon={d} className="menu-ico" />;

// WhatsApp's logo (filled, unlike the line icons above).
const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="menu-ico" aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.8 9.8 0 1 1 8.33 4.6zm8.34-18.13A11.8 11.8 0 0 0 12.04.2C5.5.2.17 5.53.17 12.08c0 2.1.55 4.13 1.59 5.93L.07 24.2l6.33-1.66a11.8 11.8 0 0 0 5.65 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.16-3.48-8.4z" />
  </svg>
);

const PIN_KEY = "fps-pin";

const pages = [
  { href: "/#top", match: "/", label: "Home", icon: I.home },
  { href: "/explore", match: "/explore", label: "Explore types", icon: I.compass },
  { href: "/work", match: "/work", label: "My work", icon: I.grid },
  { href: "/templates", match: "/templates", label: "Templates", icon: I.layers },
  { href: "/blog", match: "/blog", label: "Blog", icon: I.book },
  { href: "/#about", match: "", label: "About", icon: I.user },
];

const settings: { key: keyof Prefs; label: string; icon: ReactNode; options: { value: string; label: string; icon?: ReactNode }[] }[] = [
  {
    key: "theme",
    label: "Theme",
    icon: I.moon,
    options: [
      { value: "dark", label: "Dark", icon: I.moon },
      { value: "light", label: "Light", icon: I.sun },
      { value: "system", label: "System", icon: I.monitor },
    ],
  },
  {
    key: "text",
    label: "Text size",
    icon: I.text,
    options: [
      { value: "small", label: "Small" },
      { value: "default", label: "Default" },
      { value: "large", label: "Large" },
    ],
  },
  {
    key: "motion",
    label: "Motion",
    icon: I.motion,
    // Lightest to heaviest, left to right.
    options: [
      { value: "reduce", label: "Lite", icon: I.gaugeLow },
      { value: "lite", label: "Standard", icon: I.gaugeMid },
      { value: "full", label: "Max", icon: I.gaugeHigh },
    ],
  },
];

// The menu's trending types (profile.menuTypes). "View all" opens /explore.
const trending = profile.menuTypes.map(findType).filter((t) => t !== undefined);

// A colour and a line of advice for the current Motion level, from how close
// the frames actually shown come to the screen's refresh rate: 90% or more
// green, 60–90% amber, under that red.
function fpsVerdict(shown: number, refresh: number, motion: Prefs["motion"]): { tone: "good" | "ok" | "slow"; text: string } {
  const ratio = shown / refresh;
  if (ratio >= 0.9) return { tone: "good", text: motion === "full" ? "Running smoothly. Max is all yours." : "Running smoothly. Try Max for the full show." };
  if (ratio >= 0.6) return { tone: "ok", text: motion === "full" ? "Pretty smooth. Try Standard if it stutters." : "Pretty smooth on this setting." };
  if (motion === "reduce") return { tone: "slow", text: "This device is working hard. Lite is the lightest it gets." };
  return { tone: "slow", text: motion === "full" ? "A bit out of breath. Standard will feel better." : "Still heavy here. Lite will feel better." };
}

// The logo doubles as the site menu: navigation, the Contact page, the top
// trending website types, viewer settings (with a live frame-rate check for
// picking a Motion level, which can be pinned on screen) and my WhatsApp and
// email, in one panel.
export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  // Live frame rate: frames actually shown on screen in the last second.
  const [fps, setFps] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(60);
  const [perfOpen, setPerfOpen] = useState(false);
  // "Pin": keep the live frame rate on screen (top-left) with the menu closed.
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  // Stored prefs are only readable in the browser; sync them in after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(readPrefs());
    try {
      setPinned(localStorage.getItem(PIN_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // A live frame-rate readout while the menu is open (or pinned), refreshed
  // every second, so a Motion change shows its effect right away.
  // Measured only while someone can see it: the Performance fold is open,
  // or the FPS is pinned on screen.
  const live = (open && perfOpen) || pinned;
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const loop = (): void => {
      measureFps(1000).then((f) => {
        if (!alive) return;
        // The screen's refresh rate: the most frames ever shown in a second
        // here (at least 60), rounded to a common rate.
        setRefresh((r) => Math.max(r, [60, 75, 90, 120, 144, 165, 240].find((hz) => f.fps <= hz + 4) ?? f.fps));
        setFps(f.fps);
        loop();
      });
    };
    loop();
    return () => {
      alive = false;
      setFps(null);
    };
  }, [live]);

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try {
      if (next) localStorage.setItem(PIN_KEY, "1");
      else localStorage.removeItem(PIN_KEY);
    } catch {}
  };

  const update = (key: keyof Prefs, value: string) => {
    const next = { ...prefs, [key]: value } as Prefs;
    setPrefs(next);
    savePrefs(next, key === "motion" || motionChosen());
  };

  const verdict = fps === null ? null : fpsVerdict(fps, refresh, prefs.motion);
  // The picked Motion level, shown on the folded Performance row.
  const motionLabel = motionSetting.options.find((o) => o.value === prefs.motion)?.label;
  const shownFps = fps === null ? "··" : fps;
  // Average time each frame took to reach the screen.
  const frameMs = fps ? (1000 / fps).toFixed(1) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="menu-trigger"
      >
        <span className="menu-mark" aria-hidden />
        <span className="whitespace-nowrap text-lg font-semibold tracking-[-0.02em] sm:text-xl" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {profile.hero.first} <span className="font-normal italic">{profile.hero.accent}</span>
        </span>
        <span className="menu-caret" aria-hidden />
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div id={panelId} className="menu-panel" data-open={open || undefined} inert={!open}>
        <MenuGroup title="Navigation">
          <ul className="grid grid-cols-2 gap-1.5">
            {pages.map((p) => (
              <li key={p.label}>
                <Link href={p.href} className="menu-nav" aria-current={p.match === pathname ? "page" : undefined} onClick={() => setOpen(false)}>
                  <Icon d={p.icon} />
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </MenuGroup>

        {/* Contact is its own page, where visitors write their message to me. */}
        <section className="menu-contact-card">
          <Link href="/contact" className="menu-contact-main" onClick={() => setOpen(false)}>
            <span>
              <small className="menu-eyebrow">
                <i className="u-live" aria-hidden /> Let&apos;s connect
              </small>
              <b>Customise your website plan</b>
              <span className="menu-contact-sub">Pick what you need and send me your plan.</span>
            </span>
            <span className="menu-contact-go" aria-hidden>
              <Icon d={I.arrow} />
            </span>
          </Link>
        </section>

        <MenuGroup
          title="Trending websites"
          icon={I.flame}
          action={
            <Link href="/explore" className="menu-viewall" onClick={() => setOpen(false)}>
              View all →
            </Link>
          }
        >
          <ul className="grid grid-cols-2 gap-1.5">
            {trending.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/websites/${t.slug}`}
                  className="menu-type"
                  style={{ "--c": t.color, ...artVars(t.slug, t.color) } as CSSProperties}
                  onClick={() => setOpen(false)}
                >
                  <ArtIcon icon={artIcon(t.slug)} className="menu-ico" />
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </MenuGroup>

        <MenuGroup title="Settings" icon={I.gear}>
          <div className="space-y-2">
            {settings
              .filter((s) => s.key !== "motion")
              .map((s) => (
                <Setting key={s.key} s={s} value={prefs[s.key]} onPick={(v) => update(s.key, v)} />
              ))}
            {/* Motion and the live FPS are for the curious: folded away
                under "Performance" so the menu stays simple for everyone else. */}
            <details className="menu-perf" open={perfOpen} onToggle={(e) => setPerfOpen(e.currentTarget.open)}>
              <summary>
                <span className="menu-setting-ico">
                  <Icon d={I.gauge} />
                </span>
                Performance
                <span className="menu-perf-hint">{motionLabel}</span>
                <span className="menu-perf-chev" aria-hidden />
              </summary>
              <div className="space-y-2 pt-2">
                <Setting s={motionSetting} value={prefs.motion} onPick={(v) => update("motion", v)} />
                <div className="menu-fps" data-tone={verdict?.tone}>
                  <i aria-hidden />
                  <b>{shownFps}</b> fps
                  <span>
                    {verdict ? verdict.text : "Measuring your device…"}
                    {frameMs && (
                      <small className="menu-fps-screen">
                        {" "}
                        {frameMs} ms a frame · screen {refresh} Hz
                      </small>
                    )}
                  </span>
                  <button type="button" role="switch" aria-checked={pinned} onClick={togglePin} className="menu-switch" title="Keep the live FPS on screen">
                    <Icon d={I.pin} />
                    Pin
                    <span aria-hidden />
                  </button>
                </div>
              </div>
            </details>
          </div>
        </MenuGroup>

        <MenuGroup title="Get in touch" icon={I.chat2}>
          <div className="grid grid-cols-2 gap-1.5">
            <a href={profile.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="menu-touch menu-touch-wa">
              <WhatsAppLogo />
              WhatsApp
            </a>
            <a href={`mailto:${profile.contact.email}`} title={profile.contact.email} className="menu-touch">
              <Icon d={I.mail} />
              Email
            </a>
          </div>
        </MenuGroup>

        <p className="px-1 text-xs text-fg/45">
          {profile.role} · {profile.location}
        </p>
      </div>

      {/* The pinned live FPS, top-left, while the menu is closed. */}
      {pinned && !open && (
        <p className="fps-badge" data-tone={verdict?.tone} aria-hidden>
          <i />
          <b>{shownFps}</b> fps
        </p>
      )}
    </div>
  );
}

type SettingDef = (typeof settings)[number];
const motionSetting = settings.find((s) => s.key === "motion")!;

// One setting: its icon and label, then its options as a segmented control.
function Setting({ s, value, onPick }: { s: SettingDef; value: string; onPick: (value: string) => void }) {
  return (
    <div className="menu-setting">
      <span className="menu-setting-label">
        <span className="menu-setting-ico">
          <Icon d={s.icon} />
        </span>
        {s.label}
      </span>
      <div role="radiogroup" aria-label={s.label} className="menu-segment">
        {s.options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onPick(o.value)}>
            {o.icon && <Icon d={o.icon} />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuGroup({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-fg/10 pb-4">
      <h2 className="mb-2.5 flex items-center gap-2 px-1 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-fg/45">
        {icon && <ArtIcon icon={icon} className="menu-ico menu-ico-acid" />}
        {title}
        {action && <span className="ml-auto normal-case tracking-normal">{action}</span>}
      </h2>
      {children}
    </section>
  );
}
