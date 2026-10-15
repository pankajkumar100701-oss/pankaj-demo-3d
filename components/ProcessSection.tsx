// Before the FAQ: how a website gets made, from the first message to after
// it's live, with rough times for each step.
const steps = [
  { title: "We talk", time: "Day 1", text: "You tell me about your business on WhatsApp, a call or the Contact page. Rough ideas are fine." },
  { title: "Plan & price", time: "1–2 days", text: "I send you a simple plan: the pages, what each one does, a fixed price and a date." },
  { title: "Design", time: "3–7 days", text: "You see how the site will look on phone and laptop, and we change whatever you don't like." },
  { title: "Build & review", time: "1–3 weeks", text: "I build the real site and share a private link, so you can try it on your own phone before anyone else sees it." },
  { title: "Live & looked after", time: "Launch day", text: "Domain, hosting and Google set up in your name. I stay around for fixes and updates after." },
];

export default function ProcessSection() {
  return (
    <section id="process" className="h-sec" aria-labelledby="process-title">
      <div className="h-wrap">
        <p className="h-kicker">How it works</p>
        <h2 id="process-title" className="h-title">
          From first message
          <br />
          <em>to a live website.</em>
        </h2>
        <ol className="f-steps">
          {steps.map((s, i) => (
            <li key={s.title}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <small>{s.time}</small>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
