// Blog posts (/blog and /blog/<slug>). Each post is a list of blocks: a
// heading (h), a paragraph (p) or a bullet list (list). Newest first.
import { domainHosting, maintenance, money, prices } from "@/data/pricing";

export type Block = { h: string } | { p: string } | { list: string[] };
export type Post = { slug: string; title: string; blurb: string; date: string; minutes: number; body: Block[] };

export const posts: Post[] = [
  {
    slug: "website-cost-india",
    title: "How much does a website cost in India in 2026?",
    blurb: "Real numbers for small businesses, what pushes the price up, and the costs people forget about.",
    date: "2026-10-10",
    minutes: 4,
    body: [
      { p: "It's the first thing everyone asks me, and the honest answer is: it depends on what the site has to do. But \"it depends\" isn't much help, so here are real numbers from the work I do." },
      { h: "Rough prices" },
      {
        list: [
          `A personal portfolio or one-page site: from ${money(prices.portfolio.from)}`,
          `A business site for a shop, clinic, salon or gym (4–6 pages): ${money(prices.business.from)} to ${money(prices.fitness.from + 8000)}`,
          `A restaurant with a menu, table booking and maps: from ${money(prices.restaurants.from)}`,
          `Real estate, hotels or travel, with listings and enquiries: from ${money(prices["real-estate"].from)}`,
          `An online store with cart, UPI and cash on delivery: from ${money(prices.store.from)}`,
        ],
      },
      { h: "What makes it cost more" },
      { p: "The number of pages matters less than you'd think. What really adds to the price is anything that has to work behind the scenes: online payments, booking slots, an admin panel where you edit things yourself, or a site in two languages." },
      { h: "The costs people forget" },
      {
        list: [
          `Domain and hosting: about ${money(domainHosting.from)} to ${money(domainHosting.to)} a year, paid to the provider.`,
          `Maintenance, if you want someone to update things for you: ${money(maintenance.from)} to ${money(maintenance.to)} a month.`,
          "Good photos. A phone with decent light is often enough, but they make a bigger difference than any design.",
        ],
      },
      { h: "Cheap vs. good" },
      { p: "You'll find ₹2,999 websites online. Usually they're a template with your name swapped in, slow on phones and hard to change later. That can be fine to start with. Just ask who owns the domain, and whether you can leave with your site if you want to." },
      { p: "If you want an exact number for your business, send me what you need and I'll reply with a fixed price. No obligation." },
    ],
  },
  {
    slug: "website-vs-instagram",
    title: "Do I need a website if I already have Instagram?",
    blurb: "Instagram is great for being seen. Here's why a website still matters, and when you can skip it.",
    date: "2026-10-05",
    minutes: 3,
    body: [
      { p: "Plenty of businesses run perfectly well on Instagram alone. So it's a fair question. Here's how I think about it." },
      { h: "What Instagram is good at" },
      { p: "Being seen. Reels, stories and posts keep you in front of people who already follow you. For a bakery, a boutique or a makeup artist, that's huge." },
      { h: "Where it falls short" },
      {
        list: [
          "People searching on Google (\"salon near me\", \"PG in Noida\") won't find your Instagram. They'll find your competitor's website.",
          "Prices, timings and services get buried under posts. Customers ask the same questions in DMs again and again.",
          "You don't own your account. If it gets hacked or the algorithm changes, you start from zero.",
          "Some people simply trust a business more when it has a proper website.",
        ],
      },
      { h: "The best setup" },
      { p: "Use both. Instagram brings people in, and your website answers their questions and gets them to book, call or buy. Put the website link in your bio, and a button to your Instagram on the site." },
      { p: "If you only sell to people who already know you, Instagram might be enough for now. The day you want strangers to find you, get a website." },
    ],
  },
  {
    slug: "before-you-get-a-website",
    title: "What to keep ready before you get a website",
    blurb: "A short checklist that saves a week of back and forth, and makes your site better too.",
    date: "2026-09-28",
    minutes: 3,
    body: [
      { p: "The biggest delay in most website projects isn't design or code. It's waiting for photos and text. Keep these ready and your site can go live much faster." },
      { h: "The basics" },
      {
        list: [
          "Your business name, and your logo if you have one",
          "Phone number, WhatsApp, email and address (with a Google Maps link)",
          "Opening hours and the areas you serve",
          "Your Instagram, Facebook or YouTube links",
        ],
      },
      { h: "What you sell" },
      {
        list: [
          "A list of your services or products, with prices if you're happy to show them",
          "What makes you different, in your own words. A few lines on a WhatsApp voice note is fine.",
          "Common questions customers ask you",
        ],
      },
      { h: "Photos" },
      { p: "Ten good photos beat a hundred average ones. Your shop, your team, your work, your happy customers (with their okay). Take them in daylight and hold the phone straight." },
      { h: "One clear goal" },
      { p: "Decide what you want visitors to do: call you, book a slot, order on WhatsApp or visit the shop. Every page will be built around that one action." },
      { p: "Don't have everything? Start anyway. I can work with what you have and fill gaps as we go." },
    ],
  },
  {
    slug: "website-on-phones",
    title: "Why your website must work well on phones",
    blurb: "Most of your visitors are on a phone. Here's what to check on yours in two minutes.",
    date: "2026-09-20",
    minutes: 3,
    body: [
      { p: "In India, most people who visit a small business website are on a phone, often on mobile data. If your site only looks good on a laptop, most visitors are seeing the broken version." },
      { h: "A two-minute check" },
      {
        list: [
          "Open your site on your phone using mobile data, not Wi-Fi. Does it load in about three seconds?",
          "Can you read the text without zooming in?",
          "Can you tap the buttons easily with your thumb?",
          "Is your phone number one tap to call, and WhatsApp one tap to chat?",
          "Do the photos fit the screen, or do you have to scroll sideways?",
        ],
      },
      { h: "Why it matters" },
      { p: "People don't wait. If a page is slow or hard to use, they press back and pick the next result. Google also ranks sites that work well on phones higher." },
      { p: "Every site I build is designed for phones first and then made to look great on big screens too. If yours fails the check above, I'm happy to take a look." },
    ],
  },
];

export const findPost = (slug: string) => posts.find((p) => p.slug === slug);

export const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
