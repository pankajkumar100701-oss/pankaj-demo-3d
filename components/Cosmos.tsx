// The page's fixed backdrop: a few soft colour glows over a faint dot grid.
// Plain CSS on purpose (it used to be a WebGL scene, which made the dive and
// scrolling stutter). MultitudesHero clips #cosmos to a circle during the dive,
// so this is what the hole in the dot opens onto.
export default function Cosmos() {
  return (
    <div aria-hidden className="cosmos-root">
      <div id="cosmos" className="cosmos">
        <div className="cosmos-glow cosmos-glow-a" />
        <div className="cosmos-glow cosmos-glow-b" />
        <div className="cosmos-glow cosmos-glow-c" />
        <div className="cosmos-grid" />
      </div>
    </div>
  );
}
