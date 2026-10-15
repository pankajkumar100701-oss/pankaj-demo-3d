import Link from "next/link";
import { faqs } from "@/data/faq";

// Before Contact: common questions (data/faq.ts) as an accordion. Native
// <details>, so it works with a keyboard and a screen reader, without scripts.
export default function FaqSection() {
  return (
    <section id="faq" className="h-sec" aria-labelledby="faq-title">
      <div className="h-wrap f-faq">
        <div>
          <p className="h-kicker">FAQ</p>
          <h2 id="faq-title" className="h-title">
            Questions people
            <br />
            <em>usually ask me.</em>
          </h2>
          <p className="h-text">Prices, timelines, what happens after launch. Something else on your mind? Just ask on WhatsApp.</p>
        </div>
        <div className="f-faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="f-faq-item">
              <summary>
                <span>{f.q}</span>
                <i aria-hidden />
              </summary>
              <div className="f-faq-a">
                {f.a.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {f.link && (
                  <Link href={f.link.href} className="f-faq-link">
                    {f.link.label} <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
