# The Path to Parivaar Foundation website

Static site with no build step. Open `index.html`, or deploy the folder as-is to GitHub Pages, Netlify, or any static host.

## Structure

- `index.html`: page content, SEO meta tags, and JSON-LD structured data (NGO, WebSite, FAQPage)
- `assets/css/styles.css`: all styles, animations, and responsive rules
- `assets/js/main.js`: hero slider, scroll reveal, sticky header, back-to-top, chat panel, mobile menu
- `assets/img/`: favicons (`favicon.ico`, `favicon.svg`), app icons (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) and the social share image (`social-share.jpg`, 1200×630)
- `assets/brand/`: logo files for use anywhere
  - `logo.svg` / `logo-1024.png`: full-colour logo for light backgrounds
  - `logo-light.svg` / `logo-light-1024.png`: cream and amber logo for dark backgrounds
  - `profile-cream-1080.png` / `profile-teal-1080.png`: square profile pictures for social media
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: SEO and install metadata

## Before going live

- The canonical URL, Open Graph URLs, sitemap, and robots.txt assume `https://pathtoparivaar.org/`. Update them if the domain differs.
- Add 12A and 80G registration numbers to the footer once they are issued.
- The contact form sends through Formspree. Create a form at formspree.io that emails hello@pathtoparivaar.org, then put its id in `data-formspree` on `#contact-form` in `index.html`. While it is empty the form falls back to opening an email.
- After launch, submit `sitemap.xml` in Google Search Console and create a Google Business Profile for Nashik to strengthen local search.
