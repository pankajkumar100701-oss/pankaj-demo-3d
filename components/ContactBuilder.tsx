"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { ContactSearch, type SearchOption } from "@/components/ContactSearch";
import { allTypes, findType, profile, whatsappLink } from "@/data/profile";
import { currencies, money, prices, type CurrencyCode } from "@/data/pricing";
import { addToBasket, toggleInBasket, useBasket, writeBasket } from "@/lib/basket";
import { score, search } from "@/lib/search";
import { SearchBox } from "@/components/SortFilter";

// Ideas that fit any kind of site, offered next to the chosen types' own.
const EXTRAS = ["WhatsApp chat button", "Google Maps & SEO", "Hindi + English", "Reviews section", "Blog & articles", "Admin panel to edit content", "Domain & hosting setup"];
// Budget presets as rupee ranges, shown in the visitor's currency.
const BUDGETS = [
  { id: "unsure", min: 0, max: 0 },
  { id: "u10", min: 0, max: 10000 },
  { id: "10-25", min: 10000, max: 25000 },
  { id: "25-50", min: 25000, max: 50000 },
  { id: "50+", min: 50000, max: 0 },
] as const;
const TIMELINES = ["Flexible", "ASAP", "2–4 weeks", "1–2 months"];
const CUSTOM = "Custom";
// Ideas shown before "Show more" (chosen ones always show).
const IDEAS_SHOWN = 8;
const trending = new Set(profile.multitudes.map((m) => m.slug));
const STEPS = ["about", "types", "sites", "ideas", "budget", "notes"] as const;
type StepId = (typeof STEPS)[number];
const CURRENCY_KEY = "currency";

// Every idea anyone could search for: each type's features, the general
// extras and the home page's suggestions.
const ALL_IDEAS = [...new Set([...allTypes.flatMap((t) => t.features), ...EXTRAS, ...profile.ideas.map((i) => i.name)])];
const SEARCH_OPTIONS: SearchOption[] = [
  ...allTypes.map((t) => ({ kind: "type" as const, type: t, text: `${t.title} ${t.sub} ${t.idealFor} ${t.features.join(" ")}` })),
  ...ALL_IDEAS.map((name) => ({ kind: "idea" as const, name, text: name })),
];

// A first guess at the visitor's currency, from their browser's language.
function guessCurrency(): CurrencyCode {
  // The time zone first: most browsers in India say "en-US", so the language
  // alone would show Indian visitors dollars.
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const byZone: Record<string, CurrencyCode> = {
    "Asia/Kolkata": "INR", "Asia/Calcutta": "INR", "Asia/Kathmandu": "NPR", "Asia/Katmandu": "NPR",
    "Asia/Dubai": "AED", "Asia/Singapore": "SGD", "Europe/London": "GBP",
  };
  if (byZone[zone]) return byZone[zone];
  if (zone.startsWith("Australia/")) return "AUD";
  const lang = (navigator.languages?.[0] ?? navigator.language ?? "").toUpperCase();
  const region = lang.split("-")[1] ?? "";
  const byRegion: Record<string, CurrencyCode> = {
    IN: "INR", US: "USD", GB: "GBP", AE: "AED", CA: "CAD", AU: "AUD", SG: "SGD", NP: "NPR",
    DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR", PT: "EUR", AT: "EUR", BE: "EUR", FI: "EUR",
  };
  if (byRegion[region]) return byRegion[region];
  if (lang.startsWith("AR")) return "AED";
  if (lang.startsWith("NE")) return "NPR";
  return "INR";
}

// True on phones and small tablets, where the steps fold up one at a time.
const PHONE_QUERY = "(max-width: 1023px)";
function useIsPhone() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(PHONE_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

// Text in a non-Latin script (Devanagari, Tamil, Arabic…): worth translating
// even when short, like a name.
const nonLatin = (s: string) => /[^\u0000-ɏḀ-ỿ -⁯₹\s\d]/.test(s);

// Already-translated texts, so going back and forth doesn't ask again.
const translations = new Map<string, { text: string; from: string }>();

// `text` in English, once it's been translated (after a short pause in
// typing). `always`: translate any text, not only non-Latin scripts (for the
// free-form note, which might be in Spanish, French…). Returns null while
// it's English already, empty, or the translation failed.
function useEnglish(text: string, always: boolean) {
  const trimmed = text.trim();
  const wanted = trimmed.length >= (always ? 4 : 1) && (always ? /\p{L}/u.test(trimmed) : nonLatin(trimmed));
  const [result, setResult] = useState<{ src: string; text: string; from: string } | null>(null);
  useEffect(() => {
    if (!wanted || translations.has(trimmed)) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/translate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: trimmed }), signal: ctrl.signal });
        const data = (await res.json()) as { text: string; from: string };
        translations.set(trimmed, data);
        setResult({ src: trimmed, ...data });
      } catch {}
    }, 700);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [trimmed, wanted]);
  if (!wanted) return null;
  const hit = translations.get(trimmed) ?? (result?.src === trimmed ? result : undefined);
  if (!hit || !hit.from || hit.from === "en" || hit.text.trim().toLowerCase() === trimmed.toLowerCase()) return null;
  return hit;
}

function languageName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

// The Contact page: the visitor builds their own message — who they are,
// the kinds of site they want, sites of mine they like, the ideas they want
// in it — sees it written out (and can edit it), then sends it to me on
// WhatsApp or by email. On phones each step folds into a card with a
// summary, one open at a time, so the page stays short.
export default function ContactBuilder() {
  const basket = useBasket();
  const isPhone = useIsPhone();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState<string>("unsure");
  const [customBudget, setCustomBudget] = useState("");
  const [timeline, setTimeline] = useState(TIMELINES[0]);
  const [customTimeline, setCustomTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<StepId | null>("about");
  // Their own edits to the written-out message; null while it's generated.
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  // The long lists start short (the trending types, the first ideas): on a
  // phone the whole lot is several screens of chips.
  const [allTypesShown, setAllTypesShown] = useState(false);
  // The type step's own search box (searches all types, not just the trending ones).
  const [typeQ, setTypeQ] = useState("");
  const [allIdeasShown, setAllIdeasShown] = useState(false);

  // /contact?type=salon (e.g. from a type's page) adds that type to the message.
  useEffect(() => {
    // Adds, never toggles (dev mode runs effects twice).
    const slug = new URLSearchParams(location.search).get("type");
    if (slug && findType(slug)) addToBasket("types", slug);
  }, []);

  // Their saved currency, or a guess from the browser's language.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CURRENCY_KEY);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrencyState(currencies.some((c) => c.code === saved) ? (saved as CurrencyCode) : guessCurrency());
  }, []);
  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {}
  };

  const notesEn = useEnglish(notes, true);
  const nameEn = useEnglish(name, false);
  const businessEn = useEnglish(business, false);

  const types = basket.types.map(findType).filter((t) => t !== undefined);
  const sites = profile.projects.filter((p) => basket.sites.includes(p.title));
  // Ideas live in the basket, so ones added from the home page's suggestions
  // arrive already picked. The chosen types' ideas first, then the general
  // ones, then any picked elsewhere, without repeats.
  const ideas = basket.ideas;
  const ideaOptions = [...new Set([...types.flatMap((t) => t.features), ...EXTRAS, ...ideas])];
  const toggleIdea = (f: string) => toggleInBasket("ideas", f);

  const symbol = (currencies.find((c) => c.code === currency) ?? currencies[0]).symbol;
  const budgetLabel = (id: string) => {
    if (id === CUSTOM) return customBudget ? `${symbol}${Number(customBudget).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}` : "Custom";
    const b = BUDGETS.find((x) => x.id === id) ?? BUDGETS[0];
    if (b.id === "unsure") return "Not sure yet";
    if (!b.min) return `Under ${money(b.max, currency)}`;
    if (!b.max) return `${money(b.min, currency)}+`;
    return `${money(b.min, currency)} – ${money(b.max, currency)}`;
  };
  const timelineLabel = timeline === CUSTOM ? customTimeline.trim() || "Custom" : timeline;
  // "Custom" with nothing typed yet says nothing useful: leave it out of the message.
  const budgetText = budget === CUSTOM && !customBudget ? "" : budgetLabel(budget);
  const timelineText = timeline === CUSTOM && !customTimeline.trim() ? "" : timelineLabel;
  const withEnglish = (orig: string, en: { text: string } | null) => (en ? `${en.text} (${orig})` : orig);

  const generated = (() => {
    const lines = ["Hi Pankaj! I saw your portfolio and I'd like a website.", ""];
    if (name) lines.push(`Name: ${withEnglish(name, nameEn)}`);
    if (business) lines.push(`Business: ${withEnglish(business, businessEn)}${city ? `, ${city}` : ""}`);
    else if (city) lines.push(`City: ${city}`);
    if (phone) lines.push(`Phone / WhatsApp: ${phone}`);
    if (email) lines.push(`Email: ${email}`);
    lines.push("");
    if (types.length) lines.push(`Website type: ${types.map((t) => t.title).join(", ")}`);
    if (sites.length) lines.push(`I like these sites of yours: ${sites.map((p) => `${p.title} (${p.href})`).join(", ")}`);
    const chosen = ideas.filter((f) => ideaOptions.includes(f));
    if (chosen.length) lines.push(`I'd like it to have: ${chosen.join(", ")}`);
    if (budgetText) lines.push(`Budget: ${budgetText}`);
    if (timelineText) lines.push(`Timeline: ${timelineText}`);
    if (notes.trim()) {
      lines.push("", "About my idea:");
      if (notesEn) lines.push(notesEn.text, "", `[Original, in ${languageName(notesEn.from)}: ${notes.trim()}]`);
      else lines.push(notes.trim());
    }
    lines.push("", "Could you share a plan and a price? Thanks!");
    // Sections left empty would leave a run of blank lines: keep one.
    return lines.join("\n").replace(/\n{3,}/g, "\n\n");
  })();

  const message = edited ?? generated;

  // The message box grows with the message (no scrolling inside a small box);
  // measured again when its width changes or the fonts arrive, so text is
  // never cut off.
  const fitMessage = () => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  };
  useLayoutEffect(fitMessage, [message]);
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    let width = el.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      fitMessage();
    });
    ro.observe(el);
    document.fonts?.ready.then(fitMessage);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const ready = name.trim() !== "" && (phone.trim() !== "" || email.trim() !== "");
  const subject = `Website enquiry — ${nameEn?.text ?? name ?? "from your portfolio"}${business ? ` (${businessEn?.text ?? business})` : ""}`;

  // While searching, the matching options show in full (and flash) in their lists too.
  const searching = query.trim() !== "";
  const matchOf = (text: string): "strong" | "related" | undefined => {
    if (!searching) return undefined;
    const s = score(query, text);
    return s >= 0.6 ? "strong" : s > 0 ? "related" : undefined;
  };
  const typeText = (t: (typeof allTypes)[number]) => `${t.title} ${t.sub} ${t.idealFor} ${t.features.join(" ")}`;
  const shownTypes = allTypes.filter((t) => allTypesShown || trending.has(t.slug) || basket.types.includes(t.slug) || matchOf(typeText(t)));
  const typeHits = typeQ.trim() ? search(allTypes, typeQ, typeText) : null;
  const listTypes = typeHits ? typeHits.map((h) => h.item) : shownTypes;
  const typeMatch = (t: (typeof allTypes)[number]) => (typeHits ? (typeHits.find((h) => h.item === t)?.related ? "related" : "strong") : matchOf(typeText(t)));
  const shownIdeas = ideaOptions.filter((f, i) => allIdeasShown || i < IDEAS_SHOWN || ideas.includes(f) || matchOf(f));
  const waHref = whatsappLink(message);

  const go = (id: StepId) => {
    setOpen(id);
    // Bring the opened step's header up (after it has unfolded).
    requestAnimationFrame(() => document.getElementById(`c-step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const steps = STEPS.filter((s) => s !== "sites" || profile.projects.length > 0);
  const nextOf = (id: StepId) => steps[steps.indexOf(id) + 1];
  // Phones: the bar's "Send" before the form is filled takes them to the name.
  const toDetails = () => {
    setOpen("about");
    requestAnimationFrame(() => {
      const el = document.getElementById("c-name");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {}
  };

  const pickFromSearch = (o: SearchOption) => (o.kind === "type" ? toggleInBasket("types", o.type.slug) : toggleIdea(o.name));
  const isPickedInSearch = (o: SearchOption) => (o.kind === "type" ? basket.types.includes(o.type.slug) : ideas.includes(o.name));

  const step = (id: StepId, n: string, title: string, summary: string, children: ReactNode) => {
    const next = nextOf(id);
    const titles: Record<StepId, string> = { about: "About you", types: "Type", sites: "Sites you like", ideas: "Ideas", budget: "Budget & timeline", notes: "Anything else" };
    return (
      <Step id={id} n={n} title={title} summary={summary} collapsible={isPhone} open={!isPhone || open === id} onToggle={() => (open === id ? setOpen(null) : go(id))}>
        {children}
        {isPhone && (
          <button type="button" className="c-next" onClick={() => (next ? go(next) : document.getElementById("your-message")?.scrollIntoView({ behavior: "smooth" }))}>
            {next ? `Next: ${titles[next]}` : "See your message"} <span aria-hidden>{next ? "→" : "↓"}</span>
          </button>
        )}
      </Step>
    );
  };

  const roughPrices = types.map((t) => ({ t, p: prices[t.slug] })).filter((x) => x.p);

  return (
    <div className="c-layout">
      <div className="space-y-4 sm:space-y-6">
        <ContactSearch options={SEARCH_OPTIONS} isPicked={isPickedInSearch} onPick={pickFromSearch} onQuery={setQuery} />

        <div className="c-currency">
          <label htmlFor="c-currency">Select your currency</label>
          <select id="c-currency" className="c-select" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
        </div>

        {step(
          "about",
          "01",
          "About you",
          name ? [name, phone || email].filter(Boolean).join(" · ") : "Your name and a way to reply",
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="c-name" label="Your name *" value={name} onChange={setName} autoComplete="name" />
              <Field label="Business / brand" value={business} onChange={setBusiness} autoComplete="organization" />
              <Field label="Phone / WhatsApp" value={phone} onChange={setPhone} type="tel" autoComplete="tel" placeholder="+91 …" />
              <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
              <Field label="City" value={city} onChange={setCity} autoComplete="address-level2" />
            </div>
            <p className="mt-3 text-xs text-muted">Add a phone number or an email (or both) so I can reply.</p>
          </>,
        )}

        {step(
          "types",
          "02",
          "What kind of website?",
          types.length ? types.map((t) => t.title).join(", ") : "Pick one or more",
          <>
            <SearchBox value={typeQ} onChange={setTypeQ} placeholder="Search: salon, gym, shop, hotel…" label="Search website types" className="c-type-search" />
            {typeHits?.length === 0 && <p className="mt-3 text-sm text-muted">Nothing like that yet. Pick the closest one, or describe it under &ldquo;Anything else?&rdquo;</p>}
            <ul className="c-type-list flex flex-wrap gap-2">
              {listTypes.map((t) => {
                const p = prices[t.slug];
                return (
                  <li key={t.slug} style={{ "--c": t.color, ...artVars(t.slug, t.color) } as CSSProperties}>
                    <button type="button" className="c-type" data-match={typeMatch(t)} aria-pressed={basket.types.includes(t.slug)} onClick={() => toggleInBasket("types", t.slug)}>
                      <ArtIcon icon={artIcon(t.slug)} />
                      {t.title}
                      {p && <small className="c-type-price">from {money(p.from, currency)}</small>}
                    </button>
                  </li>
                );
              })}
            </ul>
            {!typeHits && allTypes.length > trending.size && (
              <button type="button" className="c-more" onClick={() => setAllTypesShown((v) => !v)}>
                {allTypesShown ? "Show trending only" : `+ ${allTypes.length - shownTypes.length} more types`}
              </button>
            )}
            <p className="mt-3 text-xs text-muted">
              Prices are rough starting points. Not sure? <Link href="/explore" className="underline underline-offset-2">Explore every type</Link> with examples.
            </p>
          </>,
        )}

        {profile.projects.length > 0 &&
          step(
            "sites",
            "03",
            "Sites of mine you like (optional)",
            sites.length ? sites.map((p) => p.title).join(", ") : "Optional",
            <ul className="flex flex-wrap gap-2">
              {profile.projects.map((p) => (
                <li key={p.title} style={{ "--c": p.color } as CSSProperties}>
                  <button type="button" className="c-type c-site" data-match={matchOf(`${p.title} ${p.description} ${p.tags.join(" ")}`)} aria-pressed={basket.sites.includes(p.title)} onClick={() => toggleInBasket("sites", p.title)}>
                    <i aria-hidden />
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>,
          )}

        {step(
          "ideas",
          profile.projects.length > 0 ? "04" : "03",
          "Ideas to include",
          ideas.length ? `${ideas.length} picked` : "Optional",
          <>
            <ul className="flex flex-wrap gap-2">
              {shownIdeas.map((f) => (
                <li key={f}>
                  <button type="button" className="m-pill" data-match={matchOf(f)} aria-pressed={ideas.includes(f)} onClick={() => toggleIdea(f)}>
                    {f}
                  </button>
                </li>
              ))}
            </ul>
            {ideaOptions.length > IDEAS_SHOWN && (
              <button type="button" className="c-more" onClick={() => setAllIdeasShown((v) => !v)}>
                {allIdeasShown ? "Show fewer" : `+ ${ideaOptions.length - shownIdeas.length} more ideas`}
              </button>
            )}
            {types.length === 0 && <p className="mt-3 text-xs text-muted">Pick a type above for ideas made for it.</p>}
          </>,
        )}

        {step(
          "budget",
          profile.projects.length > 0 ? "05" : "04",
          "Budget & timeline",
          `${budgetLabel(budget)} · ${timelineLabel}`,
          <>
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Budget ({currency})</p>
            <Pills options={[...BUDGETS.map((b) => b.id), CUSTOM]} label={(id) => (id === CUSTOM ? "Custom" : budgetLabel(id))} value={budget} onChange={setBudget} />
            {budget === CUSTOM && (
              <label className="c-custom">
                <span>{symbol.trim()}</span>
                <input
                  className="c-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={currency === "INR" ? 1000 : 50}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Your budget"
                  aria-label={`Your budget in ${currency}`}
                  autoFocus
                />
              </label>
            )}
            <p className="mb-2 mt-5 text-xs uppercase tracking-[0.15em] text-muted">When do you need it?</p>
            <Pills options={[...TIMELINES, CUSTOM]} value={timeline} onChange={setTimeline} />
            {timeline === CUSTOM && (
              <div className="c-custom">
                <input className="c-input" value={customTimeline} onChange={(e) => setCustomTimeline(e.target.value)} placeholder="e.g. before Diwali, by 15 December" aria-label="When you need it" autoFocus />
                <input
                  className="c-input c-date"
                  type="date"
                  aria-label="Or pick a date"
                  onChange={(e) => e.target.value && setCustomTimeline(`By ${new Date(e.target.value + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`)}
                />
              </div>
            )}
          </>,
        )}

        {step(
          "notes",
          profile.projects.length > 0 ? "06" : "05",
          "Anything else?",
          notes.trim() ? notes.trim().slice(0, 48) + (notes.trim().length > 48 ? "…" : "") : "Optional — any language",
          <>
            <textarea
              className="c-input min-h-28"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What you do, who your customers are, sites you like, colours…"
              aria-label="Anything else"
            />
            <p className="mt-2 text-xs text-muted">Write in any language — I&apos;ll read it in English.</p>
            {notesEn && (
              <div className="c-translated" aria-live="polite">
                <p className="text-xs font-semibold">We&apos;ll send this in English (from {languageName(notesEn.from)}):</p>
                <p className="mt-1 text-sm">{notesEn.text}</p>
              </div>
            )}
          </>,
        )}
      </div>

      <aside id="your-message" className="c-preview scroll-mt-4">
        <div className="m-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink">Your message</p>
            {edited !== null && (
              <button type="button" className="text-xs text-muted underline underline-offset-2" onClick={() => setEdited(null)}>
                Undo my edits
              </button>
            )}
          </div>
          <textarea ref={messageRef} rows={8} className="c-input c-message" value={message} onChange={(e) => setEdited(e.target.value)} aria-label="Your message (you can edit it)" />
          <p className="mt-2 text-xs text-muted">{edited === null ? "Written from your answers. Type in it to change anything." : "Edited by you. Changes above won't update it now."}</p>

          {roughPrices.length > 0 && (
            <div className="c-rough">
              <p className="font-sans text-[0.6875rem] uppercase tracking-[0.18em] text-muted">Rough price · approximate</p>
              <ul>
                {roughPrices.map(({ t, p }) => (
                  <li key={t.slug}>
                    <span>{t.title}</span>
                    <b>from {money(p.from, currency)}</b>
                    <small>{p.days}</small>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">The final price depends on what goes in. I&apos;ll confirm it on chat.</p>
            </div>
          )}

          {!ready && <p className="c-need">Add your name and a phone or email to send.</p>}
          <div className="mt-4 grid gap-2">
            <a href={ready ? waHref : undefined} aria-disabled={!ready} target="_blank" rel="noopener noreferrer" className="u-cta-primary x-btn justify-center">
              Send on WhatsApp <span aria-hidden>→</span>
            </a>
            <a
              href={ready ? `mailto:${profile.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : undefined}
              aria-disabled={!ready}
              className="u-cta-ghost x-btn justify-center"
            >
              Send by email
            </a>
            <button type="button" onClick={copy} className="x-share justify-center" aria-live="polite">
              {copied ? "Copied" : "Copy message"}
            </button>
          </div>
          {(basket.types.length > 0 || basket.sites.length > 0 || ideas.length > 0) && (
            <button type="button" className="mt-4 text-xs text-muted underline underline-offset-2" onClick={() => writeBasket({ types: [], sites: [], ideas: [] })}>
              Clear chosen types, sites &amp; ideas
            </button>
          )}
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            Or reach me directly:{" "}
            <a href={`mailto:${profile.contact.email}`} className="underline underline-offset-2">
              {profile.contact.email}
            </a>
          </p>
        </div>
      </aside>

      {/* Phones: the form is long, so seeing the message and sending it stay one tap away. */}
      <div className="c-bar">
        <a href="#your-message" className="c-bar-peek">
          Your message <span aria-hidden>↓</span>
        </a>
        {ready ? (
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="u-cta-primary x-btn justify-center">
            Send on WhatsApp <span aria-hidden>→</span>
          </a>
        ) : (
          <button type="button" onClick={toDetails} className="u-cta-primary x-btn justify-center">
            Add your details to send
          </button>
        )}
      </div>
    </div>
  );
}

// One step of the form. On phones (`collapsible`) its header is a button
// that folds it open or shut and shows what's picked so far.
function Step({ id, n, title, summary, collapsible, open, onToggle, children }: { id: StepId; n: string; title: string; summary: string; collapsible: boolean; open: boolean; onToggle: () => void; children: ReactNode }) {
  const head = (
    <>
      <span className="text-ink">{n}</span>
      <span className="min-w-0 flex-1">
        <span className="block">{title}</span>
        {collapsible && !open && <span className="c-step-sum">{summary}</span>}
      </span>
      {collapsible && (
        <svg className="c-step-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </>
  );
  return (
    <section id={`c-step-${id}`} className="c-step m-card rounded-2xl p-5 sm:p-6" data-open={open}>
      <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
        {collapsible ? (
          <button type="button" className="c-step-head" aria-expanded={open} aria-controls={`c-body-${id}`} onClick={onToggle}>
            {head}
          </button>
        ) : (
          <span className="c-step-head">{head}</span>
        )}
      </h2>
      <div id={`c-body-${id}`} className="c-step-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void; id?: string; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <input className="c-input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

function Pills({ options, value, onChange, label = (o) => o }: { options: string[]; value: string; onChange: (v: string) => void; label?: (o: string) => string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} className="m-pill" onClick={() => onChange(o)}>
          {label(o)}
        </button>
      ))}
    </div>
  );
}
