import Link from "next/link";
import { AddToMessage } from "@/components/MessageActions";
import { profile } from "@/data/profile";

// After the multitudes: suggestions for what a website could do
// (profile.ideas), each with live examples from my work where one exists,
// and a button that adds the idea to the visitor's message.
export default function IdeasSection() {
  const { ideas, projects } = profile;
  return (
    <section id="ideas" className="h-sec" aria-labelledby="ideas-title">
      <div className="h-wrap">
        <p className="h-kicker">Ideas for your website</p>
        <h2 id="ideas-title" className="h-title">
          Not sure what to add?
          <br />
          <em>Start with these.</em>
        </h2>
        <p className="h-text">Small touches that bring in real customers. Add the ones you like and they go straight into your plan, ready to send.</p>

        <ul className="h-ideas">
          {ideas.map((idea, i) => {
            const examples = (idea.seenIn ?? []).map((t) => projects.find((p) => p.title === t)).filter((p) => p !== undefined);
            return (
              <li key={idea.name}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <strong>{idea.name}</strong>
                <p>{idea.text}</p>
                {examples.length > 0 && (
                  <p className="h-idea-seen">
                    See it live:{" "}
                    {examples.map((p, j) => (
                      <span key={p.title}>
                        {j > 0 && ", "}
                        <a href={p.href} target="_blank" rel="noopener noreferrer">
                          {p.title}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
                <AddToMessage kind="ideas" id={idea.name} className="h-idea-add" label="Add to plan" />
              </li>
            );
          })}
        </ul>

        <p className="h-ideas-foot">
          Have something else in mind?{" "}
          <Link href="/contact">
            Tell me your idea <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
