// Rough starting prices and timelines, by website type (slugs from
// data/profile.ts). Used by the Contact page's price list (in the visitor's
// currency) and the FAQ. Edit freely: prices are in Indian rupees.

export type Price = { from: number; days: string };

export const prices: Record<string, Price> = {
  store: { from: 25000, days: "3–5 weeks" },
  "painting-art": { from: 12000, days: "2–3 weeks" },
  fitness: { from: 12000, days: "2–3 weeks" },
  education: { from: 15000, days: "2–4 weeks" },
  "real-estate": { from: 20000, days: "3–4 weeks" },
  salon: { from: 12000, days: "2–3 weeks" },
  restaurants: { from: 12000, days: "2–3 weeks" },
  travel: { from: 18000, days: "3–4 weeks" },
  rental: { from: 18000, days: "3–4 weeks" },
  business: { from: 10000, days: "1–2 weeks" },
  medical: { from: 15000, days: "2–3 weeks" },
  stay: { from: 20000, days: "3–4 weeks" },
  photography: { from: 10000, days: "1–2 weeks" },
  events: { from: 12000, days: "2–3 weeks" },
  interior: { from: 12000, days: "2–3 weeks" },
  professional: { from: 10000, days: "1–2 weeks" },
  startup: { from: 8000, days: "1 week" },
  portfolio: { from: 6000, days: "1 week" },
  ngo: { from: 10000, days: "2–3 weeks" },
  clubbing: { from: 12000, days: "2–3 weeks" },
  recipes: { from: 10000, days: "2 weeks" },
};

// Keeping a site running after it's live, a month: small changes (text,
// prices, photos) cost less; new pages and big changes, more.
export const maintenance = { from: 500, to: 3000, small: { from: 500, to: 1000 }, big: { from: 1000, to: 3000 } };
// A domain name and hosting, a year (paid to the provider, not to me).
export const domainHosting = { from: 800, to: 3000 };

// Rough exchange rates: how many rupees one unit of each currency buys.
// Prices are shown as approximate; I confirm the final figure on chat.
export const currencies = [
  { code: "INR", symbol: "₹", label: "Indian rupee", perUnit: 1 },
  { code: "USD", symbol: "$", label: "US dollar", perUnit: 88 },
  { code: "EUR", symbol: "€", label: "Euro", perUnit: 103 },
  { code: "GBP", symbol: "£", label: "British pound", perUnit: 118 },
  { code: "AED", symbol: "AED ", label: "UAE dirham", perUnit: 24 },
  { code: "CAD", symbol: "C$", label: "Canadian dollar", perUnit: 63 },
  { code: "AUD", symbol: "A$", label: "Australian dollar", perUnit: 58 },
  { code: "SGD", symbol: "S$", label: "Singapore dollar", perUnit: 68 },
  { code: "NPR", symbol: "Rs ", label: "Nepalese rupee", perUnit: 0.625 },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

// A rupee amount in another currency, rounded to a friendly figure
// (₹12,000 → "$140"; whole hundreds of rupees, tens of others).
export function money(inr: number, code: CurrencyCode = "INR") {
  const c = currencies.find((x) => x.code === code) ?? currencies[0];
  const raw = inr / c.perUnit;
  const step = code === "INR" || code === "NPR" ? 100 : raw >= 1000 ? 50 : 10;
  const n = Math.max(step, Math.round(raw / step) * step);
  return `${c.symbol}${n.toLocaleString(code === "INR" ? "en-IN" : "en-US")}`;
}
