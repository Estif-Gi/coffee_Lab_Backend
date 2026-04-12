# coffee_Lab_Backend

Collections overview

Collection

Maps to

events

EventCard + upcoming events section

menuitems

MenuItemCard + CategoryTabs

promotions

Home “Promotion & Highlights” cards

contactmessages

Contact form submissions

(optional) sitecontent

Hero copy, nav labels, single “about” block

1. events — EventCard

Your UI uses a single date string; in MongoDB prefer real datetimes and format on the client.

// Mongoose-style

{
  title: String,        // required
  startsAt: Date,       // e.g. event start (replaces "Apr 18, 2026 - 6:00 PM")
  endsAt: Date,         // optional
  location: String,     // required
  description: String,
  imageUrl: String,     // full URL or path to uploaded file
  published: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
}

Indexes: { published: 1, startsAt: 1 } for “upcoming” lists.

2. menuitems — MenuItemCard / CategoryTabs

{
  category: {
    type: String,
    enum: ['Coffee', 'Cold Drinks', 'Pastries / Snacks'], // keep in sync with tabs
    required: true,
  },
  name: String,           // required
  description: String,
  priceCents: Number,     // e.g. 450 = $4.50 (better than storing "$4.50" string)
  currency: { type: String, default: 'USD' },
  featured: { type: Boolean, default: false },
  imageUrl: String,       // optional (your spec had optional image)
  available: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
}

Indexes: { category: 1, sortOrder: 1 }, { featured: 1 }.

3. promotions — highlights on HomePage

{
  title: String,          // e.g. "Guest Barista Residency"
  text: String,           // short body
  imageUrl: String,
  ctaLabel: String,       // e.g. "Book Spot" (optional)
  ctaHref: String,        // optional URL or route
  published: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
}

Indexes: { published: 1, sortOrder: 1 }.

4. contactmessages — contact form

{
  name: String,           // required
  email: String,          // required, lowercase
  message: String,        // required
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}

Indexes: { createdAt: -1 } for an admin inbox.

5. (Optional) sitecontent — hero / branding

Only if you want CMS-style control instead of hardcoding in HomePage.

{
  key: { type: String, unique: true }, // e.g. "hero_home"
  headline: String,
  subheadline: String,
  heroImageUrl: String,
  badgeText: String,      // e.g. "Premium Coffee Show"
  updatedAt: Date,
}

Relationships

No references required for v1: events, menu items, and promotions are independent documents.

Later you could add eventId on promotions if a highlight always points to one event.

Express + Mongoose quick mapping

GET /api/events → Event.find({ published: true }).sort({ startsAt: 1 })

GET /api/menu → MenuItem.find({ available: true }).sort({ category: 1, sortOrder: 1 })

GET /api/promotions → Promotion.find({ published: true }).sort({ sortOrder: 1 })

POST /api/contact → ContactMessage.create({ name, email, message })

Frontend alignment

Map _id → id (or keep _id as string) for React keys.

Format priceCents / currency to the "$4.50" string your cards expect, or change the UI to use numbers.

Format startsAt (and optional endsAt) into the single line you currently show as date.

If you want, I can turn this into actual models/Event.js, MenuItem.js, etc. in your Express repo (Agent mode + path to that server).
