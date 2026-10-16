// Screenshot regression check for the rewrite (see REWRITE_PLAN.md).
//
//   node scripts/visual-check.mjs capture <outDir> [baseUrl]   (default http://localhost:3000)
//   node scripts/visual-check.mjs compare <dirA> <dirB>
//
// capture: drives headless Chrome over the DevTools protocol (no npm deps)
// through a fixed set of viewports x themes x scroll points. Math.random is
// seeded and every animation is frozen before each shot, so two captures of
// the same code match pixel for pixel.
// compare: diffs every PNG pair inside Chrome (canvas) and lists the shots
// whose changed-pixel share is over 0.1%, plus a red diff image beside them.
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME ?? "google-chrome";
const PORT = 9300 + Math.floor(Math.random() * 600);

const VIEWPORTS = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [390, 844],
];
// prefs as lib/prefs.ts stores them in localStorage.
const THEMES = {
  dark: { theme: "dark", text: "default", motion: "full" },
  light: { theme: "light", text: "default", motion: "full" },
  reduce: { theme: "dark", text: "default", motion: "reduce" },
};
// Fractions of the page's scroll height: rest, the dive, then the showcase.
const STOPS = [0, 0.03, 0.06, 0.1, 0.14, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "vc-"));
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  let page;
  for (let i = 0; i < 50 && !page; i++) {
    await wait(200);
    try {
      page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  if (!page) throw new Error("Chrome did not start");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const close = () => {
    ws.close();
    proc.kill();
    rmSync(profile, { recursive: true, force: true });
  };
  return { send, evaluate, close };
}

// Seeded Math.random (mulberry32), installed before any page script runs.
const SEED = `(()=>{let a=0x2f6b1c3d;Math.random=()=>{a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})()`;
// Finite animations jump to their end, endless loops rest at frame 0.
const FREEZE = `(async()=>{for(const a of document.getAnimations()){const t=a.effect&&a.effect.getComputedTiming();if(t&&t.iterations===Infinity){a.pause();a.currentTime=0}else{try{a.finish()}catch{a.pause()}}}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))) })()`;

async function capture(outDir, baseUrl = "http://localhost:3000") {
  mkdirSync(outDir, { recursive: true });
  const b = await launch();
  await b.send("Page.enable");
  await b.send("Page.addScriptToEvaluateOnNewDocument", { source: SEED });
  let n = 0;
  try {
    for (const [w, h] of VIEWPORTS) {
      await b.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      for (const [theme, prefs] of Object.entries(THEMES)) {
        await b.send("Page.navigate", { url: baseUrl });
        await wait(800);
        await b.evaluate(`localStorage.setItem("prefs", ${JSON.stringify(JSON.stringify(prefs))}); sessionStorage.clear()`);
        await b.send("Page.navigate", { url: baseUrl });
        await wait(4500); // entrance animations + fonts
        for (const f of STOPS) {
          await b.evaluate(`window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ${f}))`);
          await wait(1600); // the dive's eased glide settles
          await b.evaluate(FREEZE);
          const { data } = await b.send("Page.captureScreenshot", { format: "png" });
          writeFileSync(join(outDir, `${w}x${h}-${theme}-${String(f).padEnd(4, "0")}.png`), Buffer.from(data, "base64"));
          n++;
        }
      }
    }
  } finally {
    b.close();
  }
  console.log(`captured ${n} shots into ${outDir}`);
}

async function compare(dirA, dirB) {
  const files = readdirSync(dirA).filter((f) => f.endsWith(".png") && !f.endsWith(".diff.png"));
  const b = await launch();
  const bad = [];
  try {
    for (const f of files) {
      let other;
      try {
        other = readFileSync(join(dirB, f)).toString("base64");
      } catch {
        bad.push(`${f}: missing in ${dirB}`);
        continue;
      }
      const mine = readFileSync(join(dirA, f)).toString("base64");
      const r = await b.evaluate(`(async()=>{
        const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src="data:image/png;base64,"+s});
        const [x,y]=await Promise.all([load(${JSON.stringify(mine)}),load(${JSON.stringify(other)})]);
        if(x.width!==y.width||x.height!==y.height)return{size:true};
        const c=new OffscreenCanvas(x.width,x.height),g=c.getContext("2d");
        g.drawImage(x,0,0);const A=g.getImageData(0,0,x.width,x.height);
        g.drawImage(y,0,0);const B=g.getImageData(0,0,x.width,x.height);
        let diff=0;const out=g.createImageData(x.width,x.height);
        for(let i=0;i<A.data.length;i+=4){
          const d=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);
          const k=A.data[i]*0.3+A.data[i+1]*0.59+A.data[i+2]*0.11;
          if(d>24){diff++;out.data[i]=255;out.data[i+1]=0;out.data[i+2]=0;out.data[i+3]=255}
          else{out.data[i]=out.data[i+1]=out.data[i+2]=k*0.35;out.data[i+3]=255}
        }
        const share=diff/(x.width*x.height);
        if(share<=0.001)return{share};
        g.putImageData(out,0,0);const blob=await c.convertToBlob();
        const bytes=new Uint8Array(await blob.arrayBuffer());let s="";for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
        return{share,png:btoa(s)};
      })()`);
      if (r.size) bad.push(`${f}: size differs`);
      else if (r.png) {
        writeFileSync(join(dirB, f.replace(/\.png$/, ".diff.png")), Buffer.from(r.png, "base64"));
        bad.push(`${f}: ${(r.share * 100).toFixed(2)}% pixels differ`);
      }
    }
  } finally {
    b.close();
  }
  if (bad.length) {
    console.log(`${bad.length} of ${files.length} shots differ:\n  ${bad.join("\n  ")}`);
    process.exitCode = 1;
  } else console.log(`all ${files.length} shots match`);
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === "capture" && a) await capture(a, b);
else if (cmd === "compare" && a && b) await compare(a, b);
else {
  console.log("usage: node scripts/visual-check.mjs capture <outDir> [baseUrl] | compare <dirA> <dirB>");
  process.exitCode = 2;
}
