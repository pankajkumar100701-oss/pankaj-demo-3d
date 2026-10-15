"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { playExit } from "@/lib/prefs";

let pendingBack: ReturnType<typeof setTimeout> | undefined;

// A card that pops open over the page (a sheet from the bottom on phones):
// used by Explore and My work to open a compact card's full details. Closes
// on ×, Escape, the phone's back button, a tap outside it, or `onClose`.
export function PopCard({ open, onClose, label, style, children }: { open: boolean; onClose: () => void; label: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  // Where the press started: a drag that ends on the backdrop (selecting text) isn't a tap outside.
  const downOnBackdrop = useRef(false);

  // What's inside stays on screen while the card plays its closing animation,
  // though the page has already let go of it (`children` is usually empty by then).
  const [kept, setKept] = useState({ children, style });
  if (open && (kept.children !== children || kept.style !== style)) setKept({ children, style });
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      d.removeAttribute("data-closing");
      if (!d.open) d.showModal();
      return;
    }
    if (!d.open) return;
    // Reopened mid-close: stop, and the branch above takes it back.
    let cancelled = false;
    playExit(d).then(() => {
      if (cancelled) return;
      d.close();
      d.removeAttribute("data-closing");
      setShown(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Phones: the back button closes the card instead of leaving the page. An
  // entry is pushed while it's open; closing it any other way takes it back off.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    let viaBack = false;
    // A close that's immediately followed by an open (React re-running the
    // effect) keeps the entry rather than going back and forth.
    if (pendingBack) {
      clearTimeout(pendingBack);
      pendingBack = undefined;
    }
    if (!history.state?.popCard) history.pushState({ ...history.state, popCard: true }, "");
    const onPop = () => {
      viaBack = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (viaBack) return;
      pendingBack = setTimeout(() => {
        pendingBack = undefined;
        if (history.state?.popCard) history.back();
      });
    };
  }, [open]);

  // Don't let the page behind scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  // A link inside the card to another page replaces the card's history entry,
  // so Back from that page returns to the list (not to a dead "card open" step).
  const onLinkClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.("a[href]");
    const href = a?.getAttribute("href");
    if (!a || !href?.startsWith("/") || href.startsWith("//") || ((a as HTMLAnchorElement).target && (a as HTMLAnchorElement).target !== "_self")) return;
    if (!history.state?.popCard) return;
    e.preventDefault();
    router.replace(href);
  };

  return (
    <dialog
      ref={ref}
      className="pop"
      aria-label={label}
      style={open ? style : kept.style}
      onClose={onClose}
      // Escape goes through onClose too, so it gets the closing animation.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClickCapture={onLinkClick}
      // A tap on the backdrop (the dialog itself, outside its panel) closes it.
      onPointerDown={(e) => (downOnBackdrop.current = e.target === e.currentTarget)}
      onClick={(e) => e.target === e.currentTarget && downOnBackdrop.current && onClose()}
    >
      <div className="pop-panel">
        <button type="button" className="pop-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        {shown && (open ? children : kept.children)}
      </div>
    </dialog>
  );
}

// The "small / large" switch for a list of cards, shown at the top of it.
export function SizeSwitch<T extends string>({ options, value, onChange }: { options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="x-size" role="radiogroup" aria-label="Card size">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} data-size={o.value} onClick={() => onChange(o.value)}>
          <SizeIcon size={o.value} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SizeIcon({ size }: { size: string }) {
  // Large: one wide block; medium: two; small: a grid of four.
  const rects =
    size === "large" ? [[3, 3, 18, 18]] : size === "medium" ? [[3, 3, 8, 18], [13, 3, 8, 18]] : [[3, 3, 8, 8], [13, 3, 8, 8], [3, 13, 8, 8], [13, 13, 8, 8]];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" />
      ))}
    </svg>
  );
}

// A size remembered per browser under `key`, read after hydration.
export function readSize<T extends string>(key: string, allowed: readonly { value: T }[]): T | null {
  try {
    const saved = localStorage.getItem(key);
    return allowed.some((s) => s.value === saved) ? (saved as T) : null;
  } catch {
    return null;
  }
}
export function saveSize(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {}
}
