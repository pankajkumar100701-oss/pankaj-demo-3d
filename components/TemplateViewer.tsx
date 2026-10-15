"use client";

import { useEffect, useMemo, useState } from "react";
import { highlight } from "@/lib/highlight";

// A template's page body: Preview (the template running in a sandboxed
// iframe) and Code (that same HTML, numbered), with copy, download and
// full-screen actions. What's copied is exactly what's previewed (the preview
// route serves the same file with a guard that keeps its links inside the frame).
export default function TemplateViewer({ slug, title, code }: { slug: string; title: string; code: string }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {}
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code], { type: "text/html" }));
    a.download = `${slug}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const fullScreen = () => window.open(`/templates/${slug}/preview`, "_blank", "noopener");

  // Only tokenised once the Code tab is first opened.
  const [codeSeen, setCodeSeen] = useState(false);
  if (tab === "code" && !codeSeen) setCodeSeen(true);
  const lines = useMemo(() => (codeSeen ? highlight(code) : []), [code, codeSeen]);

  return (
    <div className="t-viewer m-rise">
      <div className="t-bar">
        <div className="t-tabs" role="tablist" aria-label="View">
          <button type="button" role="tab" id="t-tab-preview" aria-controls="t-panel" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>
            Preview
          </button>
          <button type="button" role="tab" id="t-tab-code" aria-controls="t-panel" aria-selected={tab === "code"} onClick={() => setTab("code")}>
            Code
          </button>
        </div>
        <div className="t-actions">
          <button type="button" onClick={copy} className="t-act t-act-main">
            {copied ? "Copied ✓" : "Copy code"}
          </button>
          <button type="button" onClick={download} className="t-act">
            Download
          </button>
          <button type="button" onClick={fullScreen} className="t-act t-act-wide">
            Full screen ↗
          </button>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="t-stage" id="t-panel" role="tabpanel" aria-labelledby="t-tab-preview">
          <div className="m-browser-bar t-browser-bar">
            <i />
            <i />
            <i />
            <span>{slug}.html</span>
          </div>
          <iframe title={`${title} — live preview`} src={`/templates/${slug}/preview`} sandbox="allow-scripts allow-forms" className="t-frame" />
        </div>
      ) : (
        <div className="t-editor" id="t-panel" role="tabpanel" aria-labelledby="t-tab-code">
          <div className="t-editor-bar" aria-hidden>
            <i />
            <i />
            <i />
            <span>{slug}.html</span>
          </div>
          <pre className="t-code" tabIndex={0} aria-label={`${title} source code`}>
            <code>
              {lines.map((l, i) => (
                <span key={i} className="t-line">
                  <b aria-hidden>{i + 1}</b>
                  {l.length === 0
                    ? " "
                    : l.map((tok, k) =>
                        tok.c ? (
                          <span key={k} className={`hl-${tok.c}`}>
                            {tok.t}
                          </span>
                        ) : (
                          tok.t
                        ),
                      )}
                </span>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
