// What each website type's page (/websites/<slug>) offers: the different
// websites I can build for that kind of business, each with a line on what it
// does and what it includes. Visitors can add any of them to their message.
// Edit freely; a type missing here just shows its features and websites.

export type Kind = { title: string; text: string; has: string[] };

export const kinds: Record<string, Kind[]> = {
  store: [
    { title: "Full online store", text: "Your whole catalogue online with cart, payments and delivery — a shop that sells while you sleep.", has: ["Catalogue & search", "UPI / card / COD", "Order tracking"] },
    { title: "WhatsApp catalogue site", text: "Browse products, tap “Order on WhatsApp” — the simplest way for a local shop to sell online.", has: ["Product pages", "WhatsApp ordering", "No monthly fees"] },
    { title: "Single-product / D2C brand", text: "One hero product told beautifully, with reviews and a quick checkout that converts.", has: ["Product story", "Reviews", "Fast checkout"] },
    { title: "Handmade & boutique shop", text: "Warm, story-led store for handmade goods, boutiques and small makers.", has: ["Maker story", "Collections", "Gift options"] },
    { title: "Wholesale / B2B catalogue", text: "Bulk prices, minimum order quantities and quote requests for dealers.", has: ["Price lists", "MOQ", "Quote request"] },
  ],
  "painting-art": [
    { title: "Artist portfolio", text: "A quiet gallery of your work that lets each piece breathe, with your story beside it.", has: ["Gallery", "Artist story", "Contact"] },
    { title: "Art shop", text: "Sell originals and prints online, with sizes, prices and what's still available.", has: ["Originals & prints", "Availability", "Payments"] },
    { title: "Commission site", text: "Show past commissions and let people request their own portrait or piece.", has: ["Past commissions", "Request form", "Pricing guide"] },
    { title: "Gallery / exhibition site", text: "For galleries and studios: current shows, artists and visit details.", has: ["Exhibitions", "Artists", "Visit info"] },
    { title: "Classes & workshops", text: "Art classes, workshops and online courses with batches and sign-ups.", has: ["Workshops", "Batches", "Sign-ups"] },
  ],
  fitness: [
    { title: "Gym website", text: "Membership plans, facilities and timings, with a free-trial button that fills your gym.", has: ["Plans", "Facilities", "Free trial"] },
    { title: "Yoga / Zumba studio", text: "Calm or energetic: class schedule, instructors and drop-in or monthly bookings.", has: ["Class schedule", "Instructors", "Bookings"] },
    { title: "Personal trainer site", text: "Your programmes, client transformations and online coaching — all in your name.", has: ["Programmes", "Transformations", "Online coaching"] },
    { title: "CrossFit / sports academy", text: "Batches, coaches, events and admissions for academies and boxes.", has: ["Batches", "Coaches", "Events"] },
    { title: "Diet & nutrition coach", text: "Diet plans, consultations and a BMI / calorie tool that starts the conversation.", has: ["Diet plans", "BMI tool", "Consult booking"] },
  ],
  education: [
    { title: "Coaching centre", text: "Courses, batches, fees and results up front, with a free demo class one tap away.", has: ["Courses & fees", "Results", "Demo booking"] },
    { title: "Home / online tutor", text: "Your subjects, timings and student reviews — so parents trust you before the first call.", has: ["Subjects", "Reviews", "Enquiry"] },
    { title: "School website", text: "Admissions, notices, gallery and staff for schools that want to look as good as they are.", has: ["Admissions", "Notices", "Gallery"] },
    { title: "Online course site", text: "Sell recorded or live courses with lessons, quizzes and payments.", has: ["Lessons", "Quizzes", "Payments"] },
    { title: "Exam-prep / test series", text: "JEE, NEET, govt exams: test series, notes and toppers that prove it works.", has: ["Test series", "Notes", "Toppers"] },
  ],
  "real-estate": [
    { title: "Property listings site", text: "Homes, plots and offices people can filter by area, budget and type.", has: ["Listings", "Filters", "Site visits"] },
    { title: "Builder project site", text: "One premium page per project: floor plans, amenities, location and price list.", has: ["Floor plans", "Amenities", "Brochure"] },
    { title: "Broker / agent profile", text: "Your listings and your name — leads go straight to your WhatsApp.", has: ["Your listings", "Profile", "WhatsApp leads"] },
    { title: "Rental & PG / co-living", text: "Rooms, PGs and flats for rent with photos, rent and availability.", has: ["Rooms", "Rent & deposit", "Availability"] },
    { title: "Plots & farmland", text: "Plot layouts, maps and documents for land and farmhouse projects.", has: ["Layouts", "Map", "Documents"] },
  ],
  salon: [
    { title: "Salon website", text: "Services and prices at a glance, and appointments booked in seconds.", has: ["Service menu", "Booking", "Offers"] },
    { title: "Spa & wellness", text: "Calm, premium pages for massages, therapies and packages.", has: ["Therapies", "Packages", "Booking"] },
    { title: "Makeup artist portfolio", text: "Bridal and party looks that sell your skill, with date enquiries.", has: ["Lookbook", "Bridal packages", "Date enquiry"] },
    { title: "Nail / lash studio", text: "Designs gallery, price list and slot booking for nail and lash studios.", has: ["Designs", "Prices", "Slots"] },
    { title: "Beauty academy", text: "Courses, certificates and admissions for beauty and makeup academies.", has: ["Courses", "Certificates", "Admissions"] },
  ],
  restaurants: [
    { title: "Restaurant website", text: "A menu that makes people hungry, table bookings and directions in one place.", has: ["Digital menu", "Table booking", "Map"] },
    { title: "Café website", text: "The vibe of the place, today's specials and your Instagram — before they walk in.", has: ["Specials", "Photos", "Instagram feed"] },
    { title: "QR menu", text: "Scan-at-the-table menu you can update any time — no reprinting.", has: ["QR code", "Live prices", "Veg / non-veg filter"] },
    { title: "Cloud kitchen / delivery", text: "Order online or on WhatsApp, with links to Zomato and Swiggy.", has: ["Online orders", "WhatsApp", "Delivery areas"] },
    { title: "Bakery & sweets shop", text: "Cakes, sweets and custom orders with photos and pre-booking.", has: ["Custom cakes", "Pre-orders", "Gallery"] },
    { title: "Catering service", text: "Menus, packages and enquiries for weddings and events.", has: ["Packages", "Menus", "Event enquiry"] },
  ],
  travel: [
    { title: "Tour packages site", text: "Packages that sell the trip — itinerary, price and what's included.", has: ["Packages", "Itinerary", "Enquiry"] },
    { title: "Trek & adventure", text: "Treks, camps and adventure trips with difficulty, dates and batch sizes.", has: ["Treks", "Dates", "Batch booking"] },
    { title: "Taxi / cab service", text: "Routes, fares and one-tap booking on call or WhatsApp.", has: ["Routes & fares", "Fleet", "Booking"] },
    { title: "Travel agency", text: "Flights, hotels, visas and holidays — one trusted agency site.", has: ["Services", "Destinations", "Reviews"] },
    { title: "Pilgrimage / yatra", text: "Char Dham, Vaishno Devi and more: yatra packages with full details.", has: ["Yatra packages", "Stays", "Helpline"] },
  ],
  rental: [
    { title: "Car & bike rental", text: "Pick a vehicle, choose dates, confirm — prices and availability always clear.", has: ["Fleet", "Date booking", "Documents"] },
    { title: "Outfit / costume rental", text: "Traditional wear, lehengas and costumes for weddings and events, by date.", has: ["Collections", "Rental dates", "Try-on"] },
    { title: "Equipment hire", text: "Cameras, tools, sound and party gear with daily rates and deposits.", has: ["Catalogue", "Daily rates", "Deposit"] },
    { title: "Camping & trek gear", text: "Tents, sleeping bags and gear on rent for trips and treks.", has: ["Gear list", "Bundles", "Pickup points"] },
    { title: "Furniture & appliances", text: "Monthly rental of furniture and appliances for students and families.", has: ["Monthly plans", "Delivery", "Maintenance"] },
  ],
  business: [
    { title: "Company website", text: "What you do, why you, and an easy way to get in touch — a site that wins trust.", has: ["Services", "About & team", "Enquiry"] },
    { title: "Manufacturer / exporter", text: "Products, certifications and factory photos for buyers in India and abroad.", has: ["Product catalogue", "Certifications", "Quote request"] },
    { title: "Local service business", text: "Plumbers, electricians, repair shops: services, areas and a call button.", has: ["Services", "Service areas", "Call / WhatsApp"] },
    { title: "Agency / consultancy", text: "Case studies and clients that show what you've done for others.", has: ["Case studies", "Clients", "Proposals"] },
    { title: "Brand story site", text: "Handmade, heritage or local brands told as a story people remember.", has: ["Story", "Products", "Press"] },
  ],
  medical: [
    { title: "Clinic website", text: "Treatments explained simply, timings and fees up front, appointments online.", has: ["Treatments", "Timings", "Appointments"] },
    { title: "Doctor profile", text: "Your qualifications, experience and reviews — patients find and trust you.", has: ["Qualifications", "Reviews", "Booking"] },
    { title: "Dental clinic", text: "Treatments, smile gallery and before/after with easy booking.", has: ["Treatments", "Smile gallery", "Booking"] },
    { title: "Diagnostic lab", text: "Tests, packages, home sample collection and online reports.", has: ["Test packages", "Home collection", "Reports"] },
    { title: "Physio / therapy / counselling", text: "Gentle pages for therapies and sessions, with a free first consultation.", has: ["Therapies", "Sessions", "Free consult"] },
  ],
  stay: [
    { title: "Homestay website", text: "Rooms that look as good as they are, and direct bookings with no OTA commission.", has: ["Rooms", "Direct booking", "Nearby places"] },
    { title: "Hotel website", text: "Rooms, dining, events and offers for hotels of any size.", has: ["Rooms", "Dining", "Offers"] },
    { title: "Resort & villa", text: "Premium, photo-first pages for resorts, villas and farm stays.", has: ["Gallery", "Experiences", "Packages"] },
    { title: "Hostel / backpacker", text: "Beds, vibes and events for hostels — built for young travellers on phones.", has: ["Dorms", "Events", "Booking"] },
    { title: "Stays booking platform", text: "Many properties in one place, with search, filters and wishlists.", has: ["Search", "Listings", "Wishlist"] },
  ],
  photography: [
    { title: "Photographer portfolio", text: "Big, fast galleries that let your best shots do the talking.", has: ["Galleries", "About", "Contact"] },
    { title: "Wedding photography", text: "Wedding stories, packages and date-availability enquiries.", has: ["Wedding stories", "Packages", "Date check"] },
    { title: "Studio / product shoots", text: "Studio services, product shoot rates and bookings for brands.", has: ["Services", "Rates", "Booking"] },
    { title: "Client album delivery", text: "Private, password-protected albums for clients to view and download.", has: ["Private albums", "Downloads", "Selections"] },
  ],
  events: [
    { title: "Event planner", text: "Past events as stories, packages and enquiries for the big day.", has: ["Event gallery", "Packages", "Enquiry"] },
    { title: "Banquet / venue", text: "Halls, capacity, menus and date availability for venues.", has: ["Halls", "Capacity", "Date check"] },
    { title: "Wedding website / e-invite", text: "A page for your wedding: story, events, venue map and RSVPs.", has: ["Our story", "Events & map", "RSVP"] },
    { title: "Decorator / DJ", text: "Themes, setups and packages for decorators, DJs and entertainers.", has: ["Themes", "Packages", "Booking"] },
  ],
  interior: [
    { title: "Interior designer portfolio", text: "Projects room by room, your style and how you work.", has: ["Projects", "Process", "Consultation"] },
    { title: "Architect firm", text: "Projects, philosophy and team for architecture studios.", has: ["Projects", "Team", "Contact"] },
    { title: "Modular kitchen / furniture", text: "Designs, materials and a cost estimator that brings in leads.", has: ["Designs", "Materials", "Cost estimator"] },
    { title: "Before / after showcase", text: "Slide-to-compare transformations that sell renovations.", has: ["Before / after", "Budgets", "Enquiry"] },
  ],
  professional: [
    { title: "CA / tax consultant", text: "Services in plain words — GST, ITR, audits — and a consultation one tap away.", has: ["Services", "Due dates", "Consultation"] },
    { title: "Lawyer / law firm", text: "Practice areas, experience and a confidential enquiry form.", has: ["Practice areas", "Profile", "Enquiry"] },
    { title: "Insurance / finance advisor", text: "Plans explained simply, with calculators and callback requests.", has: ["Plans", "Calculators", "Callback"] },
    { title: "Consultant profile", text: "Your expertise, articles and booking for any kind of consultant.", has: ["Expertise", "Articles", "Booking"] },
  ],
  startup: [
    { title: "Launch landing page", text: "One clear message and a sign-up — perfect for launching something new.", has: ["Hero", "Sign-up", "FAQs"] },
    { title: "App / SaaS website", text: "Features, pricing and demos that show the product instead of telling.", has: ["Features", "Pricing", "Demo"] },
    { title: "Waitlist page", text: "Collect early users before you launch, with a referral twist.", has: ["Waitlist", "Referrals", "Countdown"] },
    { title: "Offer / campaign page", text: "One sharp page for a sale, an event or an ad campaign.", has: ["Offer", "Timer", "Lead form"] },
  ],
  portfolio: [
    { title: "Personal portfolio", text: "Your work, your story and a way for the right people to reach you.", has: ["Projects", "About", "Contact"] },
    { title: "Résumé site", text: "A living CV that stands out to recruiters, with a PDF download.", has: ["Experience", "Skills", "PDF résumé"] },
    { title: "Creator / influencer", text: "Your content, brand collabs and media kit in one link.", has: ["Content", "Media kit", "Collabs"] },
    { title: "Freelancer site", text: "Services, rates and testimonials that turn visitors into clients.", has: ["Services", "Rates", "Testimonials"] },
  ],
  ngo: [
    { title: "NGO website", text: "Your cause, your impact in numbers and an easy way to help.", has: ["Cause", "Impact", "Donate"] },
    { title: "Donation / fundraiser", text: "A campaign page with a goal, updates and online donations.", has: ["Goal tracker", "Updates", "UPI donations"] },
    { title: "Volunteer & events", text: "Drives, events and volunteer sign-ups in one place.", has: ["Events", "Sign-ups", "Gallery"] },
    { title: "Trust / temple / society", text: "Activities, notices and donation details for trusts and communities.", has: ["Activities", "Notices", "80G info"] },
  ],
  clubbing: [
    { title: "Club / lounge", text: "Tonight's line-up, table bookings and the energy of the night.", has: ["Line-up", "Table booking", "Gallery"] },
    { title: "Bar & pub", text: "Menu, happy hours, live matches and events for bars.", has: ["Menu", "Happy hours", "Events"] },
    { title: "DJ / artist", text: "Mixes, gigs and booking for DJs and performers.", has: ["Mixes", "Gigs", "Booking"] },
    { title: "Event nights / tickets", text: "Event pages with guest lists and ticket links.", has: ["Events", "Guest list", "Tickets"] },
  ],
  recipes: [
    { title: "Food blog", text: "Recipes people can actually follow, searchable by ingredient.", has: ["Recipes", "Search", "Newsletter"] },
    { title: "Home chef / tiffin", text: "Daily menus, subscriptions and orders for home kitchens.", has: ["Daily menu", "Subscriptions", "WhatsApp orders"] },
    { title: "Cooking classes", text: "Classes, workshops and recorded courses for chefs who teach.", has: ["Classes", "Courses", "Sign-ups"] },
    { title: "Video recipes", text: "YouTube and Instagram recipes organised into a proper site.", has: ["Videos", "Categories", "Printable recipes"] },
  ],
};
