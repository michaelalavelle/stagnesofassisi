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
- Shows homepage announcements from WordPress.com at build time.
- Falls back to local markdown announcements if WordPress is unavailable.
- Renders events from local markdown content.
- Provides a working contact form via Formspree with client-side validation and inline error/success handling.
- Uses responsive navigation (desktop nav + mobile menu) and shared site layout/styling.

## Tech Stack

- Astro `^5.17.1`
- Content collections (`astro:content`) for local structured content
- Formspree for contact form delivery
- GitHub Pages deployment (static output)

## Project Structure

- `src/pages/` route pages
  - `src/pages/index.astro` home page + announcement loading logic
  - `src/pages/events.astro` events listing
  - `src/pages/resources.astro` OFS links and essential documents
  - `src/pages/contact.astro` Formspree contact form
- `src/layouts/BaseLayout.astro` shared header, nav, footer, metadata
- `src/styles/global.css` global theme and component styles
- `src/content/`
  - `announcements/` local fallback announcements
  - `events/` event entries
  - `config.ts` collection schemas
- `public/` static files (images, PDFs, favicon)
- `astro.config.mjs` site and base path for GitHub Pages

## Homepage Announcements

Primary source:

- WordPress.com REST API:
  - `https://public-api.wordpress.com/rest/v1.1/sites/stagnesofassisiofs.wordpress.com/posts/?number=3&fields=title,date,URL,excerpt`

Behavior:

- On build, homepage pulls latest 3 posts from WordPress.
- If fetch fails or returns no posts, homepage uses local markdown files in `src/content/announcements/`.

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

- Events are loaded from `src/content/events/*.md`
- Sorted by date ascending
- Rendered with title, date, optional location, and markdown body

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

- If homepage announcements look outdated, verify the WordPress.com site has published posts and the API endpoint is reachable.
- Keep external document links in `src/pages/resources.astro` up to date.
- If repo name or Pages URL changes, update `astro.config.mjs` `site` and `base`.
