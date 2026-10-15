// Viewer preferences (theme, text size, motion). Stored in
// localStorage and mirrored onto <html> as data-* attributes the CSS reads.

export type Prefs = {
  theme: "dark" | "light" | "system";
  text: "small" | "default" | "large";
  // Our own switch, not the OS "reduce motion" setting: plenty of laptops ship
  // with OS animations off, which would silently strip the whole site's motion.
  // "lite" keeps the scroll animations but drops the decorative idle loops
  // (the same as PerfGuard's automatic data-lite); "reduce" stills everything.
  motion: "full" | "lite" | "reduce";
};

export const DEFAULT_PREFS: Prefs = { theme: "dark", text: "default", motion: "full" };

const KEY = "prefs";
// Set by PerfGuard once this browser is seen dropping frames (see there).
export const LITE_KEY = "perf-lite";
export const PREFS_EVENT = "prefs-change";

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function resolveTheme(theme: Prefs["theme"]) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// True once the viewer has picked a motion level themselves; PerfGuard then
// leaves it alone.
export function motionChosen() {
  try {
    return "motion" in JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return false;
  }
}

// `motionPicked`: the viewer chose this motion level (rather than it being
// the default). Only then does it override PerfGuard's automatic Standard.
export function applyPrefs(p: Prefs, motionPicked = motionChosen()) {
  const html = document.documentElement;
  html.dataset.theme = resolveTheme(p.theme);
  html.dataset.text = p.text;
  html.dataset.motion = p.motion === "reduce" ? "reduce" : "full";
  if (!motionPicked) return;
  if (p.motion === "lite") html.setAttribute("data-lite", "");
  else if (p.motion === "full") {
    html.removeAttribute("data-lite");
    try {
      sessionStorage.removeItem(LITE_KEY);
    } catch {}
  }
}

// Frames actually shown on screen over `ms`, a second. Browsers draw at most
// once per screen refresh, so this tops out at the screen's rate (60, 120…).
export function measureFps(ms = 1000): Promise<{ fps: number }> {
  return new Promise((resolve) => {
    let frames = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      else frames++;
      if (now - start < ms) {
        requestAnimationFrame(tick);
        return;
      }
      resolve({ fps: Math.round((frames * 1000) / (now - start)) });
    };
    requestAnimationFrame(tick);
  });
}

export function motionReduced() {
  return document.documentElement.dataset.motion === "reduce";
}

// Saves the motion level only once the viewer has picked one themselves, so
// changing just the theme or text size doesn't pin motion to the default.
export function savePrefs(p: Prefs, motionPicked = motionChosen()) {
  const stored: Partial<Prefs> = { ...p };
  if (!motionPicked) delete stored.motion;
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {}
  applyPrefs(p, motionPicked);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

// Same as readPrefs + applyPrefs, inlined in <head> so the page paints in the
// right theme before React loads.
export const prefsScript = `(function(){try{var p=JSON.parse(localStorage.getItem("${KEY}")||"{}"),h=document.documentElement,t=p.theme||"${DEFAULT_PREFS.theme}";if(t==="system")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";h.dataset.theme=t;h.dataset.text=p.text||"${DEFAULT_PREFS.text}";h.dataset.motion=p.motion==="reduce"?"reduce":"full";if(p.motion==="lite"||(!p.motion&&sessionStorage.getItem("${LITE_KEY}")))h.dataset.lite=""}catch(e){}})()`;

// Plays an element's closing animation, then resolves. The animation is CSS
// on `[data-closing]` (see "Closing" in globals.css), defined for Max motion
// only, so on the other levels this resolves at once and things just close.
// The caller removes `data-closing` once it has closed the element.
export function playExit(el: Element | null): Promise<void> {
  if (!el) return Promise.resolve();
  el.setAttribute("data-closing", "");
  const exits = el.getAnimations().filter((a) => a instanceof CSSAnimation && a.animationName.endsWith("-out"));
  if (!exits.length) return Promise.resolve();
  // A timeout too, in case the tab is hidden and the animation never runs.
  return Promise.race([Promise.all(exits.map((a) => a.finished)).then(() => {}), new Promise<void>((r) => setTimeout(r, 800))]).catch(() => {});
}
