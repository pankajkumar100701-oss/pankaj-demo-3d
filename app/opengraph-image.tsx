import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/data/profile";

// The preview card shown when the site's link is shared (WhatsApp, X, LinkedIn…).
export const alt = `${profile.brand} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The Pankaj Studio mark, read once.
const mark = `data:image/png;base64,${await readFile(join(process.cwd(), "public/brand/ps-mark.png"), "base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 85% 10%, rgba(255,140,60,0.28), transparent 50%), radial-gradient(circle at 0% 100%, rgba(255,99,56,0.2), transparent 55%), #0e0b0a",
          color: "#f4f1ea",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={mark} height={150} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#9a9d96" }}>
            {profile.hero.eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 700, marginTop: 16, lineHeight: 1 }}>
            {profile.hero.first}
            <span style={{ color: "#f08a3c", fontStyle: "italic", marginLeft: 28 }}>{profile.hero.accent}</span>
          </div>
          <div style={{ fontSize: 38, marginTop: 32, color: "#c4c7bf" }}>{profile.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
