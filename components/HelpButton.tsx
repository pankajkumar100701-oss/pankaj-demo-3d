"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data/profile";

// The phone number behind the WhatsApp link, for a plain call.
const phone = profile.contact.whatsapp.match(/wa\.me\/(\d+)/)?.[1] ?? "";

// A small "Help" button on every page (bottom-left, clear of the message
// pill and the Contact page's send bar): ways to reach me, the FAQ, and a
// note that any language is fine.
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  // Which page we're on, for the CSS that lifts the button clear of the home
  // hero's bottom bar and the Contact send bar. (Was `body:has(...)`, which made
  // every text change on the page — like the hero's zoom readout each scroll
  // frame — recalc the whole page's styles.)
  const path = usePathname();
  const at = path === "/" ? "home" : path === "/contact" ? "contact" : undefined;

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

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="f-help" data-at={at}>
      <div id={panelId} className="f-help-panel" data-open={open || undefined} inert={!open} role="dialog" aria-label="Help">
        <p className="f-help-title">Need a hand?</p>
        <p className="f-help-sub">Ask me anything. I usually reply within a few hours.</p>
        <div className="f-help-grid">
          <a href={profile.contact.whatsapp} target="_blank" rel="noopener noreferrer" onClick={close}>
            <b>WhatsApp</b>
            <small>Chat with me</small>
          </a>
          {phone && (
            <a href={`tel:+${phone}`} onClick={close}>
              <b>Call</b>
              <small>+{phone.slice(0, 2)} {phone.slice(2)}</small>
            </a>
          )}
          <a href={`mailto:${profile.contact.email}`} onClick={close}>
            <b>Email</b>
            <small>Write to me</small>
          </a>
          <Link href="/#faq" onClick={close}>
            <b>FAQ</b>
            <small>Prices, time & more</small>
          </Link>
          <Link href="/explore" onClick={close}>
            <b>Explore types</b>
            <small>Find your kind of site</small>
          </Link>
          <Link href="/contact" onClick={close}>
            <b>Get a price</b>
            <small>Plan your website</small>
          </Link>
        </div>
        <Link href="/contact" className="f-help-lang" onClick={close}>
          Don&apos;t speak Hindi or English? Write in your own language and I&apos;ll get it in English. <span aria-hidden>→</span>
        </Link>
      </div>
      <button ref={buttonRef} type="button" className="f-help-btn" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden>{open ? "×" : "?"}</span>
        <em className="f-help-label">Help</em>
      </button>
    </div>
  );
}
