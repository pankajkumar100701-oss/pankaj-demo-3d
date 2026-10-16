// The viewer's display preferences. They live in localStorage under "prefs"
// and are mirrored onto <html> as data-theme / data-text / data-motion /
// data-lite, which is all the CSS ever reads.

export type Prefs = {
  theme: "dark" | "light" | "system";
  text: "small" | "default" | "large";
  // The site's own motion switch, independent of the OS "reduce motion"
  // setting (many laptops ship with OS animations off). "lite" keeps the
  // scroll-driven motion but drops the decorative idle loops; "reduce" stills
  // everything.
  motion: "full" | "lite" | "reduce";
};

export const DEFAULT_PREFS: Prefs = { theme: "dark", text: "default", motion: "full" };

const STORAGE_KEY = "prefs";
// sessionStorage flag: this browser was seen dropping frames, so run lite.
export const LITE_KEY = "perf-lite";
// Fired on window whenever the applied prefs change.
export const PREFS_EVENT = "prefs-change";

function stored(): Partial<Prefs> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
}

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...stored() };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function resolveTheme(theme: Prefs["theme"]): "dark" | "light" {
  if (theme !== "system") return theme;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Whether the viewer has picked a motion level themselves. Only a picked
// level overrides the automatic lite mode.
export function motionChosen(): boolean {
  try {
    return "motion" in stored();
  } catch {
    return false;
  }
}

export function applyPrefs(p: Prefs, motionPicked = motionChosen()) {
  const html = document.documentElement;
  html.dataset.theme = resolveTheme(p.theme);
  html.dataset.text = p.text;
  html.dataset.motion = p.motion === "reduce" ? "reduce" : "full";
  if (!motionPicked) return;
  if (p.motion === "lite") {
    html.setAttribute("data-lite", "");
  } else if (p.motion === "full") {
    html.removeAttribute("data-lite");
    try {
      sessionStorage.removeItem(LITE_KEY);
    } catch {}
  }
}

// Stores the prefs (leaving motion out until the viewer has picked it, so a
// theme change doesn't pin motion to the default), applies them and tells
// listeners.
export function savePrefs(p: Prefs, motionPicked = motionChosen()) {
  const toStore: Partial<Prefs> = { ...p };
  if (!motionPicked) delete toStore.motion;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {}
  applyPrefs(p, motionPicked);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

export function motionReduced(): boolean {
  return document.documentElement.dataset.motion === "reduce";
}

// readPrefs + applyPrefs as a plain inline script for <head>, so the first
// paint already has the right theme, text size and motion level.
export const prefsScript = `(function(){try{var p=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}"),h=document.documentElement,t=p.theme||"${DEFAULT_PREFS.theme}";if(t==="system")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";h.dataset.theme=t;h.dataset.text=p.text||"${DEFAULT_PREFS.text}";h.dataset.motion=p.motion==="reduce"?"reduce":"full";if(p.motion==="lite"||(!p.motion&&sessionStorage.getItem("${LITE_KEY}")))h.dataset.lite=""}catch(e){}})()`;
