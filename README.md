# The Path to Parivaar Foundation website

Static site with no build step. Open `index.html`, or deploy the folder as-is to GitHub Pages, Netlify, or any static host.

## Structure

- `index.html`: page content, SEO meta tags, and JSON-LD structured data (NGO, WebSite, FAQPage)
- `assets/css/styles.css`: all styles, animations, and responsive rules
- `assets/js/main.js`: hero slider, scroll reveal, sticky header, back-to-top, chat panel, mobile menu
- `assets/img/`: founders photo and favicon
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: SEO and install metadata

## Before going live

- The canonical URL, Open Graph URLs, sitemap, and robots.txt assume `https://pathtoparivaar.org/`. Update them if the domain differs.
- Replace `[Registration and 80G/12A details]` in the footer.
- The contact form uses `mailto:`. For reliable delivery, point it at a form service (for example Netlify Forms or Formspree).
- After launch, submit `sitemap.xml` in Google Search Console and create a Google Business Profile for Nashik to strengthen local search.
