import { profile } from "@/data/profile";

// Between About and the FAQ: what clients say (profile.reviews, plain text).
// Until there are some, a short honest note.
export default function ReviewsSection() {
  const { reviews, projects } = profile;
  return (
    <section id="reviews" className="h-sec" aria-labelledby="reviews-title">
      <div className="h-wrap">
        <p className="h-kicker">Reviews</p>
        <h2 id="reviews-title" className="h-title">
          What my clients say,
          <br />
          <em>in their own words.</em>
        </h2>

        {reviews.length === 0 ? (
          <div className="h-review-empty">
            <p className="font-display text-2xl leading-snug sm:text-3xl">No reviews here yet.</p>
            <p className="h-text !mt-3">I only post real ones, so they&apos;ll show up here as my clients send them in.</p>
          </div>
        ) : (
          <ul className="h-reviews">
            {reviews.map((r) => {
              const site = projects.find((p) => p.title === r.site);
              return (
                <li key={r.name + r.text.slice(0, 20)}>
                  {r.rating && (
                    <p className="h-stars" aria-label={`${r.rating} out of 5`}>
                      {"★".repeat(r.rating)}
                      <span aria-hidden>{"★".repeat(5 - r.rating)}</span>
                    </p>
                  )}
                  <blockquote>“{r.text}”</blockquote>
                  <footer className="h-review-by">
                    <span className="h-review-avatar" aria-hidden>
                      {r.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <strong>{r.name}</strong>
                      <small>{r.role}</small>
                    </span>
                    {site && (
                      <a href={site.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${site.title}`}>
                        Visit site ↗
                      </a>
                    )}
                  </footer>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
