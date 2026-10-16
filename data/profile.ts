// Everything the site says lives here: the hero copy, the website types,
// the projects and the contact details. Edit freely; the components only read.

// A kind of website on offer.
export type WebsiteType = {
  n: string; // display number, "01"…
  slug: string;
  title: string;
  sub: string;
  color: string; // accent, a CSS colour or var()
  intro: string;
  points: string[];
  features: string[]; // things a site of this kind can have
  idealFor: string; // who it's for, comma-separated
};

// One of the 12 trending types, which also floats as a card in the hero:
// x/y are % positions in the hero "world", depth how fast it flies at you.
export type Multitude = WebsiteType & { x: number; y: number; depth: number };

export type Project = {
  title: string;
  description: string; // one line: who it's for and what it does
  tags: string[];
  href: string; // the live site
  color: string; // accent, and the backdrop when there's no screenshot
  multitude: string; // slug of the type it belongs to
  also?: string[]; // further type slugs it fits
  image?: string; // screenshot under public/, e.g. "/work/my-site.webp"
  year?: string;
  concept?: boolean; // a sample design rather than a client site
  client?: string; // who it was built for
  highlights?: string[]; // what's inside, a few words each
};

// A suggestion for a visitor's site; `seenIn` names projects that have it.
export type Idea = { name: string; text: string; seenIn?: string[] };

// A client's kind words; `site` names the project it was for.
export type Review = {
  name: string;
  role: string; // e.g. "Owner, Him Woollen"
  text: string;
  rating?: number; // 1–5
  site?: string;
};

export type Link = { label: string; href: string };

const email = "pankajstudio119@gmail.com";
// WhatsApp number: country code + number, digits only.
const whatsapp = "917833085612";

// A WhatsApp chat link with the message box pre-filled.
export const whatsappLink = (text: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

// The 12 website types in demand right now: the hero's floating cards, the
// home page's row of cards and the menu. x/y are % positions in the hero
// "world"; depth sets how fast each flies toward you on zoom. `features`
// are the ideas a visitor can pick on the Contact page.
const multitudes: Multitude[] = [
  {
    n: "01", slug: "store", title: "Online Store", sub: "Shop / Cart / Checkout", x: 1, y: 9, depth: 1.05, color: "var(--m-lime)",
    intro: "Online stores built to sell — easy to browse on a phone, quick to pay for and simple to run.",
    points: ["Catalogues, carts and checkouts that convert", "UPI, card and cash-on-delivery payments", "Orders and stock that stay in sync"],
    features: ["Product catalogue", "Cart & checkout", "UPI / card payments", "Cash on delivery", "Order updates on WhatsApp", "Discount codes", "Admin panel"],
    idealFor: "Boutiques, D2C brands, handmade goods, local shops",
  },
  {
    n: "02", slug: "painting-art", title: "Art & Artists", sub: "Galleries / Studios / Artists", x: 61, y: -1, depth: 0.92, color: "var(--m-coral)",
    intro: "Websites for painters and artists — quiet galleries that let the work breathe, and a simple way for people to buy it.",
    points: ["Online galleries and portfolios", "Shops for originals and prints", "Studio stories, letters and news"],
    features: ["Gallery", "Prices & availability", "Buy originals / prints", "Artist story", "Commission requests", "Newsletter"],
    idealFor: "Painters, illustrators, studios, galleries",
  },
  {
    n: "03", slug: "fitness", title: "Gym / Fitness", sub: "Gyms / Yoga / Trainers", x: 83, y: 37, depth: 1.18, color: "var(--m-blue)",
    intro: "Websites for gyms, yoga studios and personal trainers — plans, timings and trainers at a glance, and a quick way to book a free trial.",
    points: ["Membership plans that are easy to compare", "Class timetables and trainer profiles", "Free-trial and enquiry buttons that reach you directly"],
    features: ["Membership plans", "Class timetable", "Trainer profiles", "Free-trial booking", "Transformations gallery", "BMI / diet tools"],
    idealFor: "Gyms, yoga studios, personal trainers, CrossFit boxes",
  },
  {
    n: "04", slug: "education", title: "Coaching / Education", sub: "Tuition / Courses / Schools", x: 0, y: 57, depth: 0.82, color: "var(--m-lime)",
    intro: "Websites for coaching centres, tutors and schools — courses, results and faculty up front, and a free demo class one tap away.",
    points: ["Courses, batches and fees laid out clearly", "Results, toppers and faculty that build trust", "Demo-class and admission enquiries straight to you"],
    features: ["Courses & batches", "Faculty profiles", "Results & toppers", "Demo-class booking", "Quizzes / notes", "Admission form"],
    idealFor: "Coaching centres, home tutors, schools, online courses",
  },
  {
    n: "05", slug: "real-estate", title: "Real Estate", sub: "Properties / Builders / Agents", x: 39, y: -4, depth: 1.25, color: "var(--m-coral)",
    intro: "Websites for builders, brokers and property dealers — listings people can filter, projects that look premium and leads that land on your WhatsApp.",
    points: ["Property listings with photos, price and location", "Project pages with floor plans and amenities", "Site-visit and callback requests that reach you instantly"],
    features: ["Property listings", "Search & filters", "Floor plans", "Map & location", "Site-visit booking", "EMI calculator"],
    idealFor: "Builders, brokers, property dealers, co-living",
  },
  {
    n: "06", slug: "salon", title: "Salon & Beauty", sub: "Salons / Spas / Makeup", x: 57, y: 87, depth: 0.9, color: "var(--m-blue)",
    intro: "Websites for salons, spas and makeup artists — services and prices at a glance, a lookbook that sells, and appointments booked in seconds.",
    points: ["Service menu with clear prices", "Lookbook of your best work", "Online appointments and WhatsApp booking"],
    features: ["Service & price menu", "Appointment booking", "Lookbook gallery", "Packages & offers", "Stylist profiles", "Google reviews"],
    idealFor: "Salons, spas, makeup artists, nail & bridal studios",
  },
  {
    n: "07", slug: "restaurants", title: "Restaurants / Cafés", sub: "Menus / Tables / Orders", x: 5, y: 33, depth: 1.12, color: "var(--m-lime)",
    intro: "Websites for restaurants and cafés — a menu that makes people hungry, table bookings and the vibe of the place before they walk in.",
    points: ["A menu that's easy to read on a phone", "Table bookings and order links", "Photos, reviews and directions in one place"],
    features: ["Digital menu", "Table booking", "QR menu", "Online ordering links", "Events & offers", "Review slider"],
    idealFor: "Restaurants, cafés, cloud kitchens, bakeries",
  },
  {
    n: "08", slug: "travel", title: "Travel & Tours", sub: "Packages / Treks / Trips", x: 26, y: 87, depth: 0.76, color: "var(--m-coral)",
    intro: "Websites for travel agents and tour operators — packages that sell the trip, day-by-day plans and enquiries that turn into bookings.",
    points: ["Tour packages with itinerary and price", "Destination guides and photo galleries", "Enquiry and booking forms that reach you directly"],
    features: ["Tour packages", "Day-by-day itinerary", "Destination pages", "Enquiry / booking form", "Traveller reviews", "Photo gallery"],
    idealFor: "Travel agents, trek & tour operators, taxi services",
  },
  {
    n: "09", slug: "rental", title: "Rentals", sub: "Cars / Bikes / Equipment", x: 82, y: 81, depth: 1.28, color: "var(--m-blue)",
    intro: "Websites for rental businesses — pick a vehicle, choose dates and confirm, with prices and availability that are always clear.",
    points: ["Fleet with prices and photos", "Date-based booking and availability", "Documents, deposits and pickup details made simple"],
    features: ["Fleet / catalogue", "Date & time booking", "Price calculator", "Document upload", "Pickup locations", "WhatsApp booking"],
    idealFor: "Car & bike rentals, equipment hire, camping gear",
  },
  {
    n: "10", slug: "business", title: "Business / Brand", sub: "Companies / Startups", x: 80, y: 15, depth: 0.88, color: "var(--m-lime)",
    intro: "A professional home for your business — what you do, why you, and an easy way to get in touch. The site that makes you look as good as you are.",
    points: ["Services and work that explain you in seconds", "Trust: clients, numbers, reviews", "Enquiries that land on your WhatsApp and email"],
    features: ["Services pages", "About & team", "Client logos", "Case studies", "Enquiry form", "Blog"],
    idealFor: "Agencies, manufacturers, consultants, local services",
  },
  {
    n: "11", slug: "medical", title: "Clinic / Doctor", sub: "Clinics / Doctors / Labs", x: 20, y: -1, depth: 1.02, color: "var(--m-coral)",
    intro: "Websites for clinics, doctors and labs — treatments explained simply, timings and fees up front, and appointments booked without a phone call.",
    points: ["Doctor profiles, treatments and timings", "Online appointment booking", "Trust: qualifications, reviews and directions"],
    features: ["Doctor profiles", "Appointment booking", "Treatments & services", "Clinic timings", "Health blog", "Map & directions"],
    idealFor: "Clinics, dentists, physiotherapists, diagnostic labs",
  },
  {
    n: "12", slug: "stay", title: "Hotels & Homestays", sub: "Rooms / Rest / Travel", x: 78, y: 59, depth: 1.08, color: "var(--m-blue)",
    intro: "Websites for hotels, homestays and resorts — rooms that look as good as they are, and direct bookings without the OTA commission.",
    points: ["Rooms with photos, amenities and prices", "Direct booking and enquiry", "Nearby places, reviews and how to reach"],
    features: ["Room gallery", "Direct booking", "Amenities", "Nearby attractions", "Guest reviews", "Offers & packages"],
    idealFor: "Hotels, homestays, resorts, hostels, villas",
  },
];

// More website types: everything else I build, shown on the Explore page
// (/explore) next to the 12 above, each with its own page.
const moreTypes: WebsiteType[] = [
  {
    n: "13", slug: "photography", title: "Photography", sub: "Photographers / Studios", color: "var(--m-lime)",
    intro: "Portfolios for photographers and studios — big, fast galleries, packages and a booking form for the next shoot.",
    points: ["Full-screen galleries that load fast", "Packages and pricing", "Shoot enquiries straight to you"],
    features: ["Portfolio galleries", "Packages", "Client albums", "Booking form", "Testimonials"],
    idealFor: "Wedding & product photographers, studios, videographers",
  },
  {
    n: "14", slug: "events", title: "Weddings & Events", sub: "Planners / Venues / Parties", color: "var(--m-coral)",
    intro: "Websites for event planners, venues and decorators — past events that wow, packages and enquiries for the big day.",
    points: ["Past events as stories", "Packages and venue details", "Date-check and enquiry forms"],
    features: ["Event gallery", "Packages", "Venue details", "Date enquiry", "Wedding invite page"],
    idealFor: "Event planners, banquet halls, decorators, DJs",
  },
  {
    n: "15", slug: "interior", title: "Interior Design", sub: "Interiors / Architects", color: "var(--m-blue)",
    intro: "Websites for interior designers and architects — projects shown room by room, your process, and consultations booked online.",
    points: ["Before/after project galleries", "Design process and services", "Consultation booking"],
    features: ["Project gallery", "Before / after", "Services", "Consultation booking", "Cost estimator"],
    idealFor: "Interior designers, architects, modular kitchens",
  },
  {
    n: "16", slug: "professional", title: "CA / Lawyer", sub: "Consultants / Firms", color: "var(--m-lime)",
    intro: "Clean, trustworthy websites for CAs, lawyers and consultants — services, credentials and a consultation one tap away.",
    points: ["Services explained in plain words", "Credentials and team", "Consultation booking and FAQs"],
    features: ["Services", "Team profiles", "Consultation booking", "FAQs", "Articles / updates"],
    idealFor: "CAs, lawyers, tax consultants, insurance advisors",
  },
  {
    n: "17", slug: "startup", title: "Startup / Landing", sub: "Launches / Apps / SaaS", color: "var(--m-coral)",
    intro: "Sharp landing pages for startups and apps — one clear message, a product that's shown not told, and sign-ups that convert.",
    points: ["One-page launch sites", "Product demos and pricing", "Waitlists and sign-ups"],
    features: ["Hero & product demo", "Pricing table", "Waitlist / sign-up", "FAQs", "Analytics"],
    idealFor: "Startups, apps, product launches, offers",
  },
  {
    n: "18", slug: "portfolio", title: "Personal Portfolio", sub: "Creators / Professionals", color: "var(--m-blue)",
    intro: "A personal site that stands out — your work, your story and a way for the right people to reach you.",
    points: ["Work and case studies", "Résumé and story", "Contact and social links"],
    features: ["Projects / case studies", "Résumé", "Blog", "Contact form", "Social links"],
    idealFor: "Freelancers, creators, job seekers, influencers",
  },
  {
    n: "19", slug: "ngo", title: "NGO / Trust", sub: "Causes / Donations", color: "var(--m-lime)",
    intro: "Websites for NGOs and trusts — the cause, the impact and an easy way to donate or volunteer.",
    points: ["Your cause and impact in numbers", "Online donations", "Volunteer sign-ups and events"],
    features: ["Impact stories", "Donate button", "Volunteer form", "Events", "Reports & 80G info"],
    idealFor: "NGOs, trusts, foundations, community groups",
  },
  {
    n: "20", slug: "clubbing", title: "Clubs & Nightlife", sub: "Clubs / Bars / DJs", color: "var(--m-coral)",
    intro: "Loud, bold websites for clubs, bars and DJs — tonight's line-up, table bookings and the energy of the night.",
    points: ["Event line-ups and nights", "Table and guest-list booking", "Photos, mixes and socials"],
    features: ["Event calendar", "Table booking", "Guest list", "Photo wall", "DJ mixes"],
    idealFor: "Clubs, bars, lounges, DJs, event nights",
  },
  {
    n: "21", slug: "recipes", title: "Food Blog", sub: "Recipes / Home chefs", color: "var(--m-blue)",
    intro: "Food blogs and home-chef sites — recipes people can actually follow, and orders for your home kitchen.",
    points: ["Recipe pages with steps and timings", "Home-kitchen menus and orders", "Newsletter and socials"],
    features: ["Recipe pages", "Search by ingredient", "Home-kitchen orders", "Newsletter", "Video recipes"],
    idealFor: "Food bloggers, home chefs, tiffin services",
  },
];

// Websites you've built: each shows in the "Websites" section of its
// multitude's page, and all of them in the hero ("Websites I've built",
// hidden while this is empty). e.g.
// { title: "My site", description: "…", tags: ["Next.js"], href: "https://…", color: "#38bdf8",
//   multitude: "rental", image: "/work/my-site.jpg", year: "2026" }
const projects: Project[] = [
  {
    title: "Art by the Passenger",
    description: "A slow, warm online home for Himalayan painter Bao Han — her paintings, her story and a hand-written letter every month.",
    tags: ["Next.js", "Gallery", "Shop", "Theming"],
    href: "https://artbythrpassenger.vercel.app/",
    color: "#b45309",
    multitude: "painting-art",
    image: "/work/art-by-the-passenger.webp",
    year: "2026",
    client: "Bao Han · artist, Himalayas",
    highlights: ["Gallery · 13 works", "Prices & availability", "Story page", "Monthly letters", "Theme switcher"],
  },
  {
    title: "Saffron Hearth",
    description: "A warm, editorial site for a modern Indian restaurant — signature dishes, a filterable menu and table bookings.",
    tags: ["Next.js", "Menu", "Reservations", "Animations"],
    href: "https://restaurant-rouge-pi.vercel.app/",
    color: "#e6a03a",
    multitude: "restaurants",
    image: "/work/saffron-hearth.webp",
    year: "2026",
    concept: true,
    client: "a restaurant in Bengaluru",
    highlights: ["Menu · 4 sections", "Veg-only filter", "Table booking", "Experiences", "Review slider"],
  },
  {
    title: "Him Woollen",
    description: "A warm, handcrafted shop front for woollens made by hand in Himachal — yarn, shawls, caps and knitwear.",
    tags: ["Next.js", "Shop", "Brand", "Storytelling"],
    href: "https://himwoollen.vercel.app/",
    color: "#a8322c",
    multitude: "business",
    also: ["store"],
    image: "/work/him-woollen.webp",
    year: "2026",
    client: "Him Woollen · Himachal Pradesh",
    highlights: ["Shop", "About the craft", "Contact", "Handmade story"],
  },
  {
    title: "VidyaTutors",
    description: "Home and online tuition for Class 1–12, JEE, NEET and coding — verified tutors, a free demo class and progress parents can see.",
    tags: ["Next.js", "Tutors", "Bookings", "Quiz"],
    href: "https://vidya-tutors.vercel.app/",
    color: "#4f46e5",
    multitude: "education",
    image: "/work/vidya-tutors.webp",
    year: "2026",
    highlights: ["Subjects · 8 streams", "Tutor profiles", "Free demo booking", "How it works", "Quiz", "FAQ"],
  },
  {
    title: "IronForge Fitness",
    description: "A bold, high-energy site for a modern gym — programs, coaches, a weekly class schedule and a free trial booking.",
    tags: ["Next.js", "Schedule", "BMI Calculator", "Bookings"],
    href: "https://gym-ten-pink.vercel.app/",
    color: "#c6ff00",
    multitude: "fitness",
    image: "/work/ironforge-fitness.webp",
    year: "2026",
    concept: true,
    client: "a gym in Noida",
    highlights: ["Programs · 6 types", "Trainer profiles", "Class schedule", "BMI calculator", "Transformations", "FAQ"],
  },
  {
    title: "Aangan Estates",
    description: "An elegant property site for homes, villas and offices across Delhi NCR — search by locality, type and budget, then book a site visit.",
    tags: ["Next.js", "Listings", "Search", "EMI Calculator"],
    href: "https://real-estate-zeta-umber.vercel.app/",
    color: "#c08a4a",
    multitude: "real-estate",
    image: "/work/aangan-estates.webp",
    year: "2026",
    concept: true,
    client: "a real-estate agency in Delhi NCR",
    highlights: ["Property search", "Featured listings", "Localities", "EMI calculator", "Advisors", "Site visit booking"],
  },
  {
    title: "Still Waters Therapy",
    description: "A calm, gentle site for a counselling practice — 18 therapies from talk therapy and CBT to hypnotherapy, with a free consultation call.",
    tags: ["Next.js", "Therapies", "Filters", "Bookings"],
    href: "https://therapy-ochre.vercel.app/",
    color: "#3f5a45",
    multitude: "medical",
    image: "/work/still-waters-therapy.webp",
    year: "2026",
    concept: true,
    client: "a counselling practice",
    highlights: ["Therapies · 18", "Category filter", "Our approach", "About", "FAQ", "Free consultation"],
  },
  {
    title: "Waypoint",
    description: "A booking site for handpicked stays across India — Himalayan cabins, Goa villas, Jaipur havelis and Kerala houseboats.",
    tags: ["Next.js", "Search", "Listings", "Wishlist"],
    href: "https://stays-seven.vercel.app/",
    color: "#c2502e",
    multitude: "stay",
    image: "/work/waypoint-stays.webp",
    year: "2026",
    concept: true,
    client: "a homestay platform",
    highlights: ["Stay search", "8 stay types", "Popular destinations", "13 listings", "Wishlist", "Become a host"],
  },
  {
    title: "Aurelia Salon & Spa",
    description: "A soft, elegant site for a unisex salon — a full service menu, stylist profiles, bridal looks and easy appointment booking.",
    tags: ["Next.js", "Services", "Stylists", "Bookings"],
    href: "https://salon-virid-six.vercel.app/",
    color: "#b0705a",
    multitude: "salon",
    image: "/work/aurelia-salon.webp",
    year: "2026",
    concept: true,
    client: "a salon in Gurugram",
    highlights: ["Service menu · 6 types", "Stylist profiles", "Bridal", "Lookbook", "FAQ", "Appointment booking"],
  },
  {
    title: "Threads & Tradition",
    description: "Himachali traditional wear on rent — pattu, chola, topi and silver from Kullu, Chamba, Kinnaur and Lahaul, for a byah, mela or stage.",
    tags: ["Next.js", "Rentals", "Outfit Builder", "Bookings"],
    href: "https://threads-tradition.vercel.app/",
    color: "#c9a96e",
    multitude: "rental",
    image: "/work/threads-tradition.webp",
    year: "2026",
    concept: true,
    client: "a Himachali wear rental",
    highlights: ["Collections · 6", "Shop by occasion", "Rental dates", "Outfit builder", "Studio trial", "Journal"],
  },
  {
    title: "Safarnama Journeys",
    description: "Handcrafted holidays across India and abroad — Ladakh to the Maldives — with honest all-in pricing and a real person on call for the whole trip.",
    tags: ["Next.js", "Tour Packages", "Trip Finder", "Enquiries"],
    href: "https://travel-tour-drab.vercel.app/",
    color: "#e8643c",
    multitude: "travel",
    image: "/work/safarnama-journeys.webp",
    year: "2026",
    concept: true,
    client: "a tour company",
    highlights: ["Destinations · 5", "Packages", "60-second trip finder", "When-to-go planner", "Compare packages", "FAQ"],
  },
  {
    title: "Bazaarify",
    description: "A full online store for fashion, electronics, beauty and home — categories, deals of the day, wishlist, cart and cash on delivery.",
    tags: ["Next.js", "E-commerce", "Cart", "Deals"],
    href: "https://online-store-sooty-omega.vercel.app/",
    color: "#f97316",
    multitude: "store",
    image: "/work/bazaarify.webp",
    year: "2026",
    concept: true,
    client: "an online marketplace",
    highlights: ["Categories · 9", "Deals of the day", "Search", "Wishlist & cart", "Offers & coupons", "Bestsellers"],
  },
];

// Suggestions on the home page ("Ideas for your website"): add, remove or
// reorder freely. Each one can be added to the visitor's message.
const ideas: Idea[] = [
  { name: "Book in one tap", text: "Tables, trial classes, site visits, demo lessons: let people book straight from the page, any time of day.", seenIn: ["Saffron Hearth", "IronForge Fitness", "VidyaTutors"] },
  { name: "A smart calculator", text: "BMI for a gym, EMI for a home, fees for a course. A small tool keeps visitors on your page and starts the conversation.", seenIn: ["IronForge Fitness", "Aangan Estates"] },
  { name: "Search & filters", text: "Veg-only dishes, budget and locality, type of therapy: help people find their thing in seconds.", seenIn: ["Saffron Hearth", "Aangan Estates", "Still Waters Therapy", "Bazaarify"] },
  { name: "WhatsApp chat button", text: "Most of your customers already live on WhatsApp. One tap and they're talking to you, no forms needed.", seenIn: ["Safarnama Journeys"] },
  { name: "Reviews & results", text: "Star ratings, real reviews and before-and-after stories build trust faster than any sales line.", seenIn: ["IronForge Fitness"] },
  { name: "Google Maps & SEO", text: "Show up when someone nearby searches for what you do, with directions one tap away." },
  { name: "Wishlist / save for later", text: "Let visitors heart the rooms, products or properties they like and come back to them later.", seenIn: ["Waypoint", "Bazaarify"] },
  { name: "Hindi + English", text: "Speak your customers' language: a simple switch to read the whole site in Hindi or English." },
  { name: "Blog & articles", text: "Regular posts keep your site fresh and help you rank on Google. Short on time? I can also write the blogs for you, in your brand's voice." },
];
export const profile = {
  name: "Pankaj Kumar",
  brand: "Pankaj Studio", // the site's name: page titles, share cards, footer
  role: "UI Designer / Website Developer",
  tagline: "I build fast, playful and beautifully crafted web experiences.",
  location: "India",
  hero: {
    first: "Pankaj",
    accent: "Studio",
    eyebrow: "UI Designer / Website Developer",
    subline: "I design & build websites — for shops, gyms, artists, restaurants & more",
  },
  multitudes,
  moreTypes,
  about: [
    "I'm a UI designer and website developer from India. I design and build websites for shops, artists, gyms, restaurants, schools — anyone with something worth putting online.",
    "No copy-paste sites: every site is made for your business, loads fast and works well on a phone. Tell me what you need, and I'll take care of everything from the first sketch to the day it goes live.",
  ],
  // The "What I build" list in the About section.
  services: [
    { title: "Business websites", text: "A professional home for your shop, clinic, salon or studio." },
    { title: "Online stores", text: "Products, cart and checkout — ready to start selling." },
    { title: "Portfolios", text: "For artists, creators and professionals who want to stand out." },
    { title: "Landing pages", text: "One sharp page for a launch, an event or an offer." },
  ],
  projects,
  // The home page's row of big cards (max 10, by slug from the types above):
  // the most in-demand kinds right now, then a "See all categories" card
  // that opens /explore. Swap slugs here to change what the row shows.
  trackTypes: ["store", "restaurants", "fitness", "salon", "medical", "education", "real-estate", "stay", "business", "travel"],
  // The menu's "Trending websites" grid (6, by slug).
  menuTypes: ["store", "restaurants", "fitness", "salon", "medical", "stay"],
  // The trending websites shown in the hero (max 5): titles from `projects`
  // above, in order. Swap any title here to change what the hero shows; the
  // rest stay one click away on /work.
  trendingSites: ["IronForge Fitness", "Aangan Estates", "Waypoint", "Saffron Hearth", "Art by the Passenger"],
  ideas,
  // Reviews from real clients, as plain text: paste a client's words here and
  // they show in the home page's Reviews section and, when `site` names one
  // of the projects above, on that website's card too (/work and its type's
  // page). A "coming soon" note shows while this is empty. e.g.
  // { name: "Ravi", role: "Owner, Him Woollen", text: "…", rating: 5, site: "Him Woollen" }
  reviews: [] as Review[],
  // Swap in your real email (the `email` const above) and profile links here;
  // the site menu and the hero's "Open for projects" read from this.
  contact: {
    email,
    whatsapp: whatsappLink(
      "Hi Pankaj! I came across your portfolio and I'd like a website.\n\n" +
        "About my business/idea: \n" +
        "Type of site (business / online store / portfolio / landing page): \n" +
        "When I'd like it live: \n\n" +
        "Could you share a plan and a price? Thanks!",
    ),
    // Profile links shown in the menu, e.g. { label: "LinkedIn", href: "https://…" }.
    links: [] as Link[],
  },
};

// Every website type: the 12 trending ones first, then the rest.
export const allTypes: WebsiteType[] = [...multitudes, ...moreTypes];

export const findType = (slug: string) => allTypes.find((t) => t.slug === slug);

// Whether a project belongs under a type (its own, or one of `also`).
export const inType = (p: Project, slug: string) => p.multitude === slug || (p.also ?? []).includes(slug);

// Entries point at each other by plain strings (titles and slugs), so a typo
// would silently hide something. Fail at load instead, naming every typo.
function checkNames() {
  const titles = new Set(projects.map((p) => p.title));
  const slugs = new Set(allTypes.map((t) => t.slug));
  const missing = (names: string[], known: Set<string>, where: (name: string) => string) =>
    names.filter((name) => !known.has(name)).map(where);
  const bad = [
    ...missing(profile.trendingSites, titles, (t) => `trendingSites: "${t}"`),
    ...missing(profile.trackTypes, slugs, (s) => `trackTypes: "${s}"`),
    ...missing(profile.menuTypes, slugs, (s) => `menuTypes: "${s}"`),
    ...ideas.flatMap((i) => missing(i.seenIn ?? [], titles, (t) => `ideas "${i.name}" seenIn: "${t}"`)),
    ...profile.reviews.flatMap((r) => missing(r.site ? [r.site] : [], titles, (t) => `reviews (${r.name}) site: "${t}"`)),
    ...projects.flatMap((p) => missing([p.multitude, ...(p.also ?? [])], slugs, (m) => `projects "${p.title}" multitude: "${m}"`)),
  ];
  if (bad.length) throw new Error(`data/profile.ts: these names don't match anything:\n  ${bad.join("\n  ")}`);
}
checkNames();
