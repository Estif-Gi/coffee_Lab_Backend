Collections overview

Collection

Maps to

events

EventCard + upcoming events section

menuitems

MenuItemCard + CategoryTabs

promotions

Home “Promotion \& Highlights” cards

contactmessages

Contact form submissions

(optional) sitecontent

Hero copy, nav labels, single “about” block





1\. events — EventCard

Your UI uses a single date string; in MongoDB prefer real datetimes and format on the client.

// Mongoose-style

{

&#x20;title: String,        // required

&#x20;startsAt: Date,       // e.g. event start (replaces "Apr 18, 2026 - 6:00 PM")

&#x20;endsAt: Date,         // optional

&#x20;location: String,     // required

&#x20;description: String,

&#x20;imageUrl: String,     // full URL or path to uploaded file

&#x20;published: { type: Boolean, default: true },

&#x20;sortOrder: { type: Number, default: 0 },

&#x20;createdAt: Date,

&#x20;updatedAt: Date,

}

Indexes: { published: 1, startsAt: 1 } for “upcoming” lists.



2\. menuitems — MenuItemCard / CategoryTabs

{

&#x20;category: {

&#x20;  type: String,

&#x20;  enum: \['Coffee', 'Cold Drinks', 'Pastries / Snacks'], // keep in sync with tabs

&#x20;  required: true,

&#x20;},

&#x20;name: String,           // required

&#x20;description: String,

&#x20;priceCents: Number,     // e.g. 450 = $4.50 (better than storing "$4.50" string)

&#x20;currency: { type: String, default: 'USD' },

&#x20;featured: { type: Boolean, default: false },

&#x20;imageUrl: String,       // optional (your spec had optional image)

&#x20;available: { type: Boolean, default: true },

&#x20;sortOrder: { type: Number, default: 0 },

&#x20;createdAt: Date,

&#x20;updatedAt: Date,

}

Indexes: { category: 1, sortOrder: 1 }, { featured: 1 }.



3\. promotions — highlights on HomePage

{

&#x20;title: String,          // e.g. "Guest Barista Residency"

&#x20;text: String,           // short body

&#x20;imageUrl: String,

&#x20;ctaLabel: String,       // e.g. "Book Spot" (optional)

&#x20;ctaHref: String,        // optional URL or route

&#x20;published: { type: Boolean, default: true },

&#x20;sortOrder: { type: Number, default: 0 },

&#x20;createdAt: Date,

&#x20;updatedAt: Date,

}

Indexes: { published: 1, sortOrder: 1 }.



4\. contactmessages — contact form

{

&#x20;name: String,           // required

&#x20;email: String,          // required, lowercase

&#x20;message: String,        // required

&#x20;read: { type: Boolean, default: false },

&#x20;createdAt: { type: Date, default: Date.now },

}

Indexes: { createdAt: -1 } for an admin inbox.



5\. (Optional) sitecontent — hero / branding

Only if you want CMS-style control instead of hardcoding in HomePage.

{

&#x20;key: { type: String, unique: true }, // e.g. "hero\_home"

&#x20;headline: String,

&#x20;subheadline: String,

&#x20;heroImageUrl: String,

&#x20;badgeText: String,      // e.g. "Premium Coffee Show"

&#x20;updatedAt: Date,

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

Map \_id → id (or keep \_id as string) for React keys.

Format priceCents / currency to the "$4.50" string your cards expect, or change the UI to use numbers.

Format startsAt (and optional endsAt) into the single line you currently show as date.

If you want, I can turn this into actual models/Event.js, MenuItem.js, etc. in your Express repo (Agent mode + path to that server).







