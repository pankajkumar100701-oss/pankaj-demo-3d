"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toggleInBasket, useBasket, writeBasket, type Basket } from "@/lib/basket";
import { playExit } from "@/lib/prefs";

// "Add to message": puts a website type (or one of my websites, or an idea) into the
// visitor's message, which the Contact page turns into a WhatsApp / email.
// `addedLabel` replaces "Added" once it's in (chips keep their own name).
export function AddToMessage({ kind, id, className = "", label = "Add to message", addedLabel = "Added" }: { kind: keyof Basket; id: string; className?: string; label?: string; addedLabel?: string }) {
  const added = useBasket()[kind].includes(id);
  return (
    <button type="button" aria-pressed={added} onClick={() => toggleInBasket(kind, id)} className={`x-add ${className}`}>
      <span aria-hidden>{added ? "✓" : "+"}</span> {added ? addedLabel : label}
    </button>
  );
}

// Shares a page of this site (the phone's share sheet, or copies the link),
// so a card can be sent straight to someone.
export function ShareLink({ path, title, className = "" }: { path: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = new URL(path, location.origin).href;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <button type="button" onClick={share} className={`x-share ${className}`} aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {copied ? "Link copied" : "Share link"}
    </button>
  );
}

// Floating reminder of what's in the message, on every page but Contact. The
// "–" shrinks it to a small round badge (remembered for this visit) so it
// doesn't cover the page; tapping the badge opens it again.
const MINI_KEY = "basket-pill-mini";
export function BasketPill() {
  const basket = useBasket();
  const pathname = usePathname();
  // null until this visit's choice is read, so a small pill doesn't flash big.
  const [mini, setMini] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMini(sessionStorage.getItem(MINI_KEY) === "1");
    } catch {}
  }, []);
  const pillRef = useRef<HTMLDivElement>(null);
  // The big pill plays its closing animation (Max motion) before it goes.
  const leave = (then: () => void) => playExit(pillRef.current).then(then);
  const shrink = (v: boolean) => {
    setMini(v);
    try {
      sessionStorage.setItem(MINI_KEY, v ? "1" : "0");
    } catch {}
  };
  const count = basket.types.length + basket.sites.length + basket.ideas.length;
  if (count === 0 || pathname === "/contact" || mini === null) return null;
  if (mini)
    return (
      <button type="button" className="x-pill-mini" onClick={() => shrink(false)} aria-label={`${count} in your message — show`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <b>{count}</b>
      </button>
    );
  return (
    <div ref={pillRef} className="x-pill" role="status">
      <Link href="/contact">
        <b>{count}</b> in your message · Customise &amp; send <span aria-hidden>→</span>
      </Link>
      <button type="button" onClick={() => leave(() => shrink(true))} aria-label="Make it small" title="Make it small">
        –
      </button>
      <button type="button" onClick={() => leave(() => writeBasket({ types: [], sites: [], ideas: [] }))} aria-label="Clear your message" title="Clear">
        ×
      </button>
    </div>
  );
}
