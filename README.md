# St. Agnes of Assisi Fraternity (OFS) Website

Astro-based static website for the St. Agnes of Assisi Fraternity, OFS.

## What the Site Does

- Publishes core pages for the fraternity:
  - Home
  - About the OFS
  - Our Fraternity
  - Events
  - Resources
  - Contact
- Pulls WordPress.com posts at build time and routes them by category:
  - `Announcements` category -> Home page Announcements section
  - `Events` category -> Events page Upcoming Events section
- Falls back to local markdown content if WordPress is unavailable or no matching category posts are found.
- Provides a working contact form via Formspree with client-side validation and inline error/success handling.
- Uses responsive navigation (desktop nav + mobile menu) and shared site layout/styling.

## Tech Stack

- Astro `^5.17.1`
- Content collections (`astro:content`) for local structured content
- Formspree for contact form delivery
- GitHub Pages deployment (static output)

## Project Structure

- `src/pages/` route pages
  - `src/pages/index.astro` home page + announcements rendering
  - `src/pages/events.astro` events rendering
  - `src/pages/resources.astro` OFS links and essential documents
  - `src/pages/contact.astro` Formspree contact form
- `src/layouts/BaseLayout.astro` shared header, nav, footer, metadata
- `src/styles/global.css` global theme and component styles
- `src/lib/wordpress.ts` WordPress fetch/filter/normalization helpers
- `src/content/`
  - `announcements/` local fallback announcements
  - `events/` local fallback events
  - `config.ts` collection schemas
- `public/` static files (images, PDFs, favicon)
- `astro.config.mjs` site and base path for GitHub Pages

## WordPress Integration

Primary source endpoint:

- WordPress.com REST API:
  - `https://public-api.wordpress.com/rest/v1.1/sites/stagnesofassisiofs.wordpress.com/posts/?number=50&fields=title,date,content,categories,attachments`

Behavior:

- Posts are filtered by category slug in `src/lib/wordpress.ts`.
- Home announcements request category `announcements` and show up to 10 newest items.
- Events page requests category `events` and shows matching items.
- If WordPress fetch/filter returns no items, local content is used:
  - Home fallback: `src/content/announcements/*.md`
  - Events fallback: `src/content/events/*.md`

WordPress content rendering:

- Full post HTML content is rendered (not just excerpt).
- WordPress file embed blocks are normalized into cleaner links.
- File links are displayed with type and optional size when available, e.g. `(PDF, 248 KB)`.
- Links are normalized to open in new tabs with `rel="noreferrer"`.

## Contact Form Behavior

File: `src/pages/contact.astro`

- Posts to Formspree endpoint: `https://formspree.io/f/mgoladbv`
- Required fields:
  - Name
  - Email
  - Message
- Submit flow:
  - Native validity check (`checkValidity` / `reportValidity`)
  - Button disabled while sending
  - Inline error message for Formspree or network errors
  - On success, form is hidden and thank-you box is shown

## Events Content

File: `src/pages/events.astro`

- Primary source is WordPress category `events` (build-time fetch).
- Fallback source is `src/content/events/*.md` (sorted by date ascending).
- Rendered with item heading format: `Title (Posted DATE)`.
- For local fallback items, location is shown under the heading when provided.
- Event body content is rendered below the heading.

## Announcements Content

File: `src/pages/index.astro`

- Primary source is WordPress category `announcements` (build-time fetch), capped at 10 items.
- Fallback source is `src/content/announcements/*.md` (sorted newest-first, capped at 10).
- Rendered with item heading format: `Title (Posted DATE)` and body content below.

## Resources Content

File: `src/pages/resources.astro`

- "OFS Websites" section
- "Essential Documents" section with links to:
  - OFS Rule
  - General Constitutions
  - International Statutes
  - National Statutes
  - Ritual

## Local Development

```powershell
npm install
npm run dev
```

Build locally:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## Deployment

- Deployment target is GitHub Pages.
- Site/base configuration is in `astro.config.mjs`:
  - `site: "https://michaelalavelle.github.io"`
  - `base: "/stagnesofassisi"`
- Pushes to `main` trigger your configured Pages workflow/publish process.

## Maintenance Notes

- If homepage announcements or events look outdated:
  - Verify posts are published on WordPress.
  - Verify posts are assigned to the correct category (`Announcements` or `Events`).
  - Verify the WordPress API endpoint is reachable.
- Keep external document links in `src/pages/resources.astro` up to date.
- If repo name or Pages URL changes, update `astro.config.mjs` `site` and `base`.
