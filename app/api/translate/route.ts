// Translates a visitor's note into English, so someone who writes in their
// own language (Tamil, Bengali, Arabic…) still reaches me in English.
// POST { text } → { text, from }: `from` is the detected language code
// ("en" when it was English already). Google's free endpoint first, then
// MyMemory; if both fail, the original comes back unchanged (from: "").

const MAX = 2000;
const TIMEOUT_MS = 6000;
const CHUNK = 160;

async function google(text: string) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data = await res.json();
  // [[["translated","original",…],…], null, "detected-lang", …]
  const out = (data?.[0] as [string][] | undefined)?.map((part) => part[0]).join("") ?? "";
  if (!out) throw new Error("google: empty");
  return { text: out, from: String(data?.[2] ?? "") };
}

async function myMemoryChunk(text: string) {
  // MyMemory needs a source language; "autodetect" lets it guess.
  const url = `https://api.mymemory.translated.net/get?langpair=autodetect|en&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = await res.json();
  // It refuses English → English: the text was English already.
  if (/DISTINCT LANGUAGES/i.test(data?.responseDetails ?? "")) return { text, from: "en" };
  const out: string = data?.responseData?.translatedText ?? "";
  if (!out || Number(data?.responseStatus) !== 200) throw new Error("mymemory: failed");
  return { text: out, from: String(data?.responseData?.detectedLanguage ?? "").slice(0, 2).toLowerCase() };
}

// MyMemory takes up to 500 bytes a request (160 characters is under that
// even in Devanagari or Tamil, at 3 bytes each): send longer notes a few
// sentences at a time.
async function myMemory(text: string) {
  const chunks: string[] = [];
  for (const part of text.match(/[^.!?।\n]+[.!?।\n]*/g) ?? [text]) {
    if (chunks.length && chunks[chunks.length - 1].length + part.length <= CHUNK) chunks[chunks.length - 1] += part;
    else for (let i = 0; i < part.length; i += CHUNK) chunks.push(part.slice(i, i + CHUNK));
  }
  const done = await Promise.all(chunks.map(myMemoryChunk));
  return { text: done.map((d) => d.text).join(" ").replace(/\s+/g, " ").trim(), from: done.find((d) => d.from !== "en")?.from ?? "en" };
}

export async function POST(request: Request) {
  let text = "";
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.slice(0, MAX) : "";
  } catch {}
  if (!text.trim()) return Response.json({ text: "", from: "" }, { status: 400 });

  for (const provider of [google, myMemory]) {
    try {
      return Response.json(await provider(text));
    } catch {}
  }
  return Response.json({ text, from: "" });
}
