// Forgiving search for every search box on the site (Explore, My work,
// Templates, Contact, the Sort & filter cards). Typing something close is
// enough: typos ("resturant"), half words ("photo") and related words
// ("hotel" finds homestays, "doctor" finds clinics) all match. Each result
// gets a score, so the UI can show the best ones first and flash the
// near-misses as "related".

// Words people type, and the words our content uses for the same thing.
const RELATED: string[][] = [
  ["shop", "store", "ecommerce", "e-commerce", "cart", "sell", "products", "boutique", "online"],
  ["gym", "fitness", "yoga", "trainer", "workout", "crossfit", "zumba"],
  ["hotel", "homestay", "stay", "rooms", "resort", "hostel", "villa", "bnb"],
  ["doctor", "clinic", "medical", "hospital", "dentist", "lab", "health", "therapy", "counselling"],
  ["food", "restaurant", "cafe", "café", "menu", "dhaba", "bakery", "tiffin", "recipe", "kitchen", "chef"],
  ["school", "education", "coaching", "tuition", "course", "teacher", "academy", "class"],
  ["salon", "beauty", "spa", "makeup", "parlour", "parlor", "hair", "nails", "lash"],
  ["property", "real", "estate", "builder", "agent", "flat", "plot", "home", "house"],
  ["travel", "tour", "trip", "trek", "package", "holiday", "agency"],
  ["rent", "rental", "hire", "car", "bike", "equipment", "outfit"],
  ["art", "artist", "painting", "gallery", "studio", "creative"],
  ["wedding", "event", "party", "planner", "venue", "decorator", "dj"],
  ["lawyer", "ca", "accountant", "consultant", "tax", "legal", "firm"],
  ["startup", "landing", "launch", "app", "saas", "product"],
  ["portfolio", "personal", "resume", "creator", "freelancer", "influencer"],
  ["ngo", "trust", "charity", "donation", "donate", "volunteer", "cause"],
  ["club", "nightlife", "bar", "lounge", "pub"],
  ["photo", "photography", "photographer", "camera", "shoot", "video"],
  ["interior", "architect", "decor", "furniture", "kitchen"],
  ["business", "company", "brand", "corporate", "office", "agency"],
  ["book", "booking", "appointment", "reserve", "slot", "schedule"],
  ["pay", "payment", "upi", "checkout", "card", "razorpay"],
  ["chat", "whatsapp", "message", "contact", "enquiry"],
  ["language", "hindi", "english", "translate", "multilingual"],
  ["3d", "three", "depth", "tilt", "perspective"],
  ["scroll", "parallax", "pinned", "sticky"],
  ["gallery", "carousel", "slider", "images", "photos"],
  ["price", "pricing", "cost", "budget", "fees", "rate", "plan"],
  ["seo", "google", "maps", "search", "rank"],
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const words = (s: string) => norm(s).split(" ").filter(Boolean);

// Edits needed to turn a into b, stopping early past `max`.
function distance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// How well one typed word matches one word of the text, 0–1.
function wordScore(q: string, w: string) {
  if (w === q) return 1;
  if (w.startsWith(q)) return q.length >= 2 ? 0.9 : 0.5;
  if (q.length >= 3 && w.includes(q)) return 0.75;
  if (q.length >= 4) {
    const d = distance(q, w.slice(0, Math.max(q.length, Math.min(w.length, q.length + 1))), 2);
    if (d === 1) return 0.7;
    if (d === 2 && q.length >= 6) return 0.5;
  }
  return 0;
}

// The words related to a typed word (from RELATED), itself excluded.
function relatedTo(q: string) {
  const out = new Set<string>();
  for (const group of RELATED) if (group.some((g) => wordScore(q, g) >= 0.7)) group.forEach((g) => out.add(g));
  out.delete(q);
  return [...out];
}

// How well `query` matches `text`, 0–1. Every typed word must match
// something (directly, or through a related word); 0 means no match.
// Direct matches score 0.5–1; matches only through related words, under 0.5.
export function score(query: string, text: string) {
  const qs = words(query);
  if (!qs.length) return 1;
  const ws = words(text);
  let total = 0;
  for (const q of qs) {
    let best = 0;
    for (const w of ws) best = Math.max(best, wordScore(q, w));
    if (best < 0.5) {
      for (const r of relatedTo(q)) for (const w of ws) if (wordScore(r, w) >= 0.9) best = Math.max(best, 0.4);
    }
    if (!best) return 0;
    total += best;
  }
  return total / qs.length;
}

export type Hit<T> = { item: T; score: number; related: boolean };

// The items that match, best first. `related` marks the near-misses (found
// through a related word or a loose typo), for a softer "you might mean" look.
export function search<T>(items: readonly T[], query: string, text: (item: T) => string): Hit<T>[] {
  if (!norm(query)) return items.map((item) => ({ item, score: 1, related: false }));
  return items
    .map((item) => {
      const s = score(query, text(item));
      return { item, score: s, related: s < 0.6 };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
}
