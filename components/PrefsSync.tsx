"use client";

import { useLayoutEffect } from "react";
import { applyPrefs, PREFS_EVENT, readPrefs } from "@/lib/prefs";

// Keeps <html>'s data-* attributes in sync with the stored prefs: re-applies
// them after React's dev remount resets <html>, and follows the OS theme when
// the theme is set to "system".
export default function PrefsSync() {
  useLayoutEffect(() => {
    applyPrefs(readPrefs());
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = () => {
      const p = readPrefs();
      if (p.theme !== "system") return;
      applyPrefs(p);
      window.dispatchEvent(new Event(PREFS_EVENT));
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);
  return null;
}
