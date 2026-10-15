import Cosmos from "@/components/Cosmos";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FaqSection from "@/components/FaqSection";
import IdeasSection from "@/components/IdeasSection";
import MultitudesHero from "@/components/MultitudesHero";
import MultitudesTrack from "@/components/MultitudesTrack";
import ProcessSection from "@/components/ProcessSection";
import ReviewsSection from "@/components/ReviewsSection";
import SiteMenu from "@/components/SiteMenu";
import { profile } from "@/data/profile";

// Dive into the dot, then scroll on through the multitudes as a sideways row
// of cards, then Ideas, About, Reviews, How it works, FAQ and Contact; the footer line sits over the bottom edge of the
// last screen.
export default function Home() {
  return (
    <>
      <Cosmos />

      <header className="site-header fixed inset-x-0 top-0 z-20">
        <nav className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-12">
          <SiteMenu />
        </nav>
      </header>

      <main id="top" className="relative">
        <MultitudesHero />
        <MultitudesTrack />
        <IdeasSection />
        <AboutSection />
        <ReviewsSection />
        <ProcessSection />
        <FaqSection />
        <ContactSection />

        <footer className="pointer-events-none absolute inset-x-0 bottom-3 z-30 px-4 text-center text-xs text-fg/50">
          <p>
            © {new Date().getFullYear()} {profile.brand} · {profile.location}
            {/* Light theme's wallpaper photo is CC BY 2.0, which requires this credit. */}
            <span className="hidden [[data-theme=light]_&]:inline">
              {" · "}Paper photo by{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Free_crumpled_paper_texture_for_layers_(2978651767).jpg" target="_blank" rel="noopener noreferrer" className="pointer-events-auto underline decoration-fg/30 underline-offset-2 hover:text-fg">
                Pink Sherbet Photography
              </a>{" "}
              (CC BY 2.0)
            </span>
          </p>
        </footer>
      </main>
    </>
  );
}
