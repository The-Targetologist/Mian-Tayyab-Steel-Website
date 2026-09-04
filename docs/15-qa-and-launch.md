# 15 — QA & Launch Checklist

## Visual QA

For every major page template compare against approved design/wireframes at:
- desktop
- tablet
- mobile

Check:
- spacing
- typography
- image crops
- alignment
- grid behavior
- borders
- CTA prominence
- hover/focus states
- long text
- missing images

## Functional QA

### Navigation
- all links work
- mobile menu
- dropdowns
- breadcrumbs
- search

### Products
- archive loads
- every published product route works
- draft product inaccessible publicly
- gallery works
- specs render
- FAQs render
- relationships work

### Collections
- all structured blocks render
- tables responsive
- linked products valid

### Services
- archive/detail
- media
- FAQs
- related content

### Blog
- archive
- pagination if used
- article routes
- dates
- links

### Forms
- happy path
- invalid email/phone
- required fields
- oversized/invalid file
- spam/rate case
- server failure feedback
- database record creation

### Admin
- unauthorized access blocked
- CRUD
- draft/publish
- slug uniqueness
- image uploads
- relations
- delete confirmation
- inquiry status

## SEO QA

- page titles
- descriptions
- canonical
- H1
- schema validity
- sitemap
- robots
- noindex on staging
- redirects
- no broken internal links
- image alt
- 404 page

## Accessibility QA

Keyboard-only test:
- header/nav
- mobile menu
- search
- gallery modal
- accordion
- forms

Check:
- focus order
- focus visibility
- labels
- heading order
- landmarks
- color contrast
- reduced motion

## Performance QA

Run production build and test representative pages.

Check:
- image sizes
- LCP element
- layout shift
- bundle/client JS
- unused dependencies
- font loading
- DB query count

## Browser/device QA

At minimum:
- Chrome desktop
- Edge desktop
- Safari/iOS if available
- Android Chrome

## Content QA

- spelling/grammar
- factual claims
- product specification accuracy
- phone/email/WhatsApp
- addresses
- partner/certification claims
- brochures/PDF links
- legal pages

Never publish invented technical data.

## Security QA

- no secrets in client bundle/repo
- admin routes protected server-side
- RLS policies reviewed
- input validation server-side
- upload MIME/size validation
- rich text sanitized
- rate limiting/spam control

## Launch process

1. final backup/export of old site if replacing it
2. current URL crawl
3. production env variables
4. Supabase production project/migrations
5. storage policies
6. admin user setup
7. production deployment
8. domain/DNS
9. redirect verification
10. SSL
11. sitemap/robots
12. Search Console
13. form test from production
14. analytics if approved
15. post-launch crawl

## Post-launch

Monitor:
- 404s
- form failures
- indexing
- Core Web Vitals
- unexpected DB/auth errors
- broken images
