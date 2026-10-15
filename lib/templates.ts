import { readFileSync } from "node:fs";
import path from "node:path";

// A template's HTML (data/templates/<slug>.html). Server-only; read at build
// time, since every /templates page is static.
export function templateSource(slug: string) {
  return readFileSync(path.join(process.cwd(), "data/templates", `${slug}.html`), "utf8");
}

// Served from /templates/<slug>/preview, links resolve against *this* site,
// so a template's "Sign in" or "/pricing" would load the portfolio inside the
// preview (and a preview of a template page inside itself). This guard keeps
// every click in the preview: "#section" links scroll, the rest do nothing,
// and forms never submit anywhere.
const GUARD = `<script>(function(){document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;e.preventDefault();var h=a.getAttribute("href")||"";if(h.length>1&&h[0]==="#"){var t=document.getElementById(h.slice(1));if(t)t.scrollIntoView({behavior:"smooth"})}else if(h==="#")window.scrollTo({top:0,behavior:"smooth"})},true);document.addEventListener("submit",function(e){e.preventDefault()},true)})()</script>`;

// For the /templates cards (opened as …/preview#still): the template draws
// its first moments (once loaded, at least 24 frames and about a second, so
// slow canvas heroes have painted), then freezes, so a page of cards isn't thirty animations
// at once. The card sends "tpl:play" while it's hovered (or centred on a
// phone) and "tpl:pause" after (ignored until those first moments are drawn). Freezing holds requestAnimationFrame callbacks
// and pauses CSS animations; the full-size preview never freezes.
const STILL = `<script>(function(){if(!/still/.test(location.hash))return;var raf=window.requestAnimationFrame.bind(window),q=[],paused=false,st=document.createElement("style");st.textContent="*,*::before,*::after{animation-play-state:paused!important}";window.requestAnimationFrame=function(cb){if(!paused)return raf(cb);q.push(cb);return 0};function set(p){if(p===paused)return;paused=p;if(p){(document.head||document.documentElement).appendChild(st)}else{st.remove();var c=q;q=[];c.forEach(function(f){raf(f)})}}var first=0,warm=false,hold=function(){var n=0,t0=0;raf(function f(now){if(first<0)return;t0=t0||now;if(++n<24||now-t0<900)return raf(f);warm=true;set(true)})},go=function(){first=setTimeout(hold,300)};if(document.readyState==="complete")go();else addEventListener("load",go);addEventListener("message",function(e){if(e.data==="tpl:play"){clearTimeout(first);first=-1;warm=true;set(false)}else if(e.data==="tpl:pause"&&warm)set(true)})})()</script>`;

// An empty tab icon, so the preview doesn't ask this site for /favicon.ico.
const ICON = `<link rel="icon" href="data:,">`;

// The template as shown in a preview: the same file plus the guards above
// (the code tab and downloads still hand out the untouched file).
export function previewSource(slug: string) {
  const html = templateSource(slug);
  return html.includes("<head>") ? html.replace("<head>", `<head>${ICON}${GUARD}${STILL}`) : ICON + GUARD + STILL + html;
}
