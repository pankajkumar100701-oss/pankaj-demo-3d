import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import PrefsSync from "@/components/PrefsSync";
import { profile } from "@/data/profile";
import { DEFAULT_PREFS, prefsScript } from "@/lib/prefs";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif for the hero: a free, close cousin of the serif used on claude.ai.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.brand} — ${profile.role}`,
  description: profile.tagline,
  openGraph: {
    type: "website",
    siteName: profile.brand,
    title: `${profile.brand} — ${profile.role}`,
    description: profile.tagline,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_PREFS.theme}
      data-text={DEFAULT_PREFS.text}
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className="min-h-full font-sans">
        <PrefsSync />
        {children}
      </body>
    </html>
  );
}
