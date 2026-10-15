import Cosmos from "@/components/Cosmos";
import MultitudesHero from "@/components/MultitudesHero";
import Showcase3D from "@/components/Showcase3D";

// Demo cut for a 30s screen recording: dive into the dot, then the 3D showcase.
// Open with ?play (or press P) to auto-scroll the whole thing.
export default function Home() {
  return (
    <>
      <Cosmos />
      <main id="top" className="relative">
        <MultitudesHero />
        <Showcase3D />
      </main>
    </>
  );
}
