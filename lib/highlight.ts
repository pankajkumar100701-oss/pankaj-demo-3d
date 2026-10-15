// A small syntax highlighter for the templates' single-file HTML (with its
// <style> and <script>), so the Code tab reads like an editor. Works line by
// line, carrying which language it's in (and any open comment) to the next.
// Not a full parser: good enough for the code we hand out.

export type Token = { t: string; c?: "tag" | "attr" | "str" | "kw" | "num" | "com" | "fn" | "prop" | "punc" };
type Mode = "html" | "css" | "js";
type Rule = [RegExp, Token["c"] | ((m: string, s: State) => Token["c"])];
type State = { mode: Mode; next: Mode | null; comment: boolean };

const JS_KW =
  /(?:const|let|var|function|return|if|else|for|while|do|new|this|true|false|null|undefined|of|in|typeof|instanceof|class|import|export|from|async|await|break|continue|try|catch|finally|switch|case|default|throw)\b/y;

const rules: Record<Mode, Rule[]> = {
  html: [
    [/<!--.*?(?:-->|$)/y, "com"],
    [/<!doctype[^>]*>/iy, "kw"],
    [
      /<\/?[a-zA-Z][\w-]*/y,
      (m, s) => {
        const name = m.replace(/[</]/g, "").toLowerCase();
        if (!m.startsWith("</") && (name === "style" || name === "script")) s.next = name === "style" ? "css" : "js";
        return "tag";
      },
    ],
    [
      /\/?>/y,
      (_, s) => {
        if (s.next) {
          s.mode = s.next;
          s.next = null;
        }
        return "tag";
      },
    ],
    [/[\w:@.-]+(?==)/y, "attr"],
    [/(?<==)(?:"[^"]*"|'[^']*')/y, "str"],
  ],
  css: [
    [/\/\*.*?(?:\*\/|$)/y, "com"],
    [
      /<\/style/y,
      (_, s) => {
        s.mode = "html";
        return "tag";
      },
    ],
    [/"[^"]*"|'[^']*'/y, "str"],
    [/@[\w-]+/y, "kw"],
    [/#[0-9a-fA-F]{3,8}\b/y, "num"],
    [/-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|vh|vw|svh|dvh|%|s|ms|deg|fr|turn|ch)?/y, "num"],
    [/[\w-]+(?=\()/y, "fn"],
    [/--?[\w-]+(?=\s*:[^{]*(?:;|$))/y, "prop"],
    // Selectors: words on a line that opens a rule.
    [/[.#]?[\w-]+(?=[^;{}]*\{)/y, "tag"],
    [/!important/y, "kw"],
    [/[{}();:,]/y, "punc"],
    [/[\w-]+/y, undefined],
  ],
  js: [
    [/\/\/.*$/y, "com"],
    [/\/\*.*?(?:\*\/|$)/y, "com"],
    [
      /<\/script/y,
      (_, s) => {
        s.mode = "html";
        return "tag";
      },
    ],
    [/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y, "str"],
    [JS_KW, "kw"],
    [/\d+\.?\d*/y, "num"],
    [/[A-Za-z_$][\w$]*(?=\()/y, "fn"],
    [/[A-Za-z_$][\w$]*/y, undefined],
    [/[{}()[\];,.=+\-*/<>!?:&|]/y, "punc"],
  ],
};

export function highlight(code: string): Token[][] {
  const s: State = { mode: "html", next: null, comment: false };
  return code.split("\n").map((line) => {
    const out: Token[] = [];
    const push = (t: string, c?: Token["c"]) => {
      const last = out[out.length - 1];
      if (last && last.c === c) last.t += t;
      else out.push({ t, c });
    };
    let i = 0;
    // Still inside a multi-line comment from an earlier line.
    if (s.comment) {
      const end = s.mode === "html" ? line.indexOf("-->") : line.indexOf("*/");
      if (end === -1) return line ? [{ t: line, c: "com" }] : [];
      i = end + (s.mode === "html" ? 3 : 2);
      push(line.slice(0, i), "com");
      s.comment = false;
    }
    outer: while (i < line.length) {
      for (const [re, cls] of rules[s.mode]) {
        re.lastIndex = i;
        const m = re.exec(line);
        if (!m || !m[0]) continue;
        const c = typeof cls === "function" ? cls(m[0], s) : cls;
        push(m[0], c);
        // A comment that runs off the end of the line continues on the next.
        if (c === "com" && (m[0].startsWith("/*") ? !m[0].endsWith("*/") || m[0].length < 4 : m[0].startsWith("<!--") && !m[0].endsWith("-->"))) s.comment = true;
        i += m[0].length;
        continue outer;
      }
      push(line[i]);
      i++;
    }
    return out;
  });
}
