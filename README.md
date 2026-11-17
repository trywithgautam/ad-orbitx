# AD 0RBITX | ADS & AI MARKETING

Responsive multi-page portfolio with motion graphics, browser-based control panel, blog publishing, projects and SEO setup.

## Pages and core files
- `index.html` — Home, services preview, auto-advancing Meta Ads case studies, latest blogs and contact.
- `services.html`, `pricing.html`, `projects.html`, `blog.html` — Separate public pages.
- `admin.html` — Content control panel.
- `content.json` — Editable brand, SEO, hero, services, pricing, projects, blogs, Meta Ads slides, contact and social links.
- `assets/blog-meta-ads.svg`, `assets/blog-website-converts.svg` — Local editorial thumbnail artwork for the starter blog posts.

The footer uses recognizable Facebook, Instagram, LinkedIn, Fiverr and Upwork brand icons. These icon images are served from the Simple Icons CDN.
- `admin.js` — Add/edit/delete services, packages, projects, Meta Ads case studies and blog posts.
- `build.py` — Generates static blog article pages with individual SEO title, description, canonical URL, Open Graph and BlogPosting structured data.
- `.github/workflows/pages.yml` — GitHub Pages build/deploy workflow.
- `robots.txt`, `sitemap.xml` — Search crawler files.

## Publish
1. Upload all files, including the hidden `.github` folder, to the root of a GitHub repository.
2. In GitHub **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`; the workflow generates blog pages and deploys the website.
4. Replace `YOUR-DOMAIN.example` in `build.py`, `robots.txt` and HTML canonical URLs with your actual domain or GitHub Pages URL.
5. Verify the site in Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`.

## Control panel workflow
Open `admin.html` from the hosted website or serve the folder locally (do not open the HTML file directly). The panel now auto-saves edits in the current browser; the top **Save** button also saves manually. Click **Export JSON** to download the updated `content.json`. This saves a draft in that browser's local storage. Click **Download content.json**, replace the repository's `content.json` with the downloaded file, and commit/push it. GitHub Actions rebuilds blog pages and sitemap.

**Important limitation:** this static panel is not a secure multi-user CMS and does not publish directly to GitHub. Local edits are not visible to visitors until you export and commit `content.json`. For live multi-device editing with login and direct publishing, connect a hosted CMS/backend with authentication. Do not store passwords or private customer data here.

## Blog publishing
In Admin → Blog manager, add title, slug, category, date, excerpt, featured image URL, article body, SEO meta title and SEO meta description. Export and commit `content.json`. The workflow generates `/blog/your-slug/` with readable article content and individual SEO metadata.

## Before launch
- Set business email, WhatsApp and Facebook, Instagram, LinkedIn, Fiverr and Upwork URLs in Admin.
- Add actual Meta Ads screenshots and verified results; starter slides are placeholders.
- Replace sample projects with real work and approved outcomes.
- Replace all domain placeholders in canonical URLs, `robots.txt` and `build.py`.
- Submit sitemap in Google Search Console and Bing Webmaster Tools. SEO setup helps discovery but cannot guarantee indexing or rankings.
- Contact form uses `mailto:` and does not store submissions on a server.

## Run locally
Run `python -m http.server 8000` in the site folder and visit `http://localhost:8000`.
