# fivedaylaunch — SMB Website Score (Chrome Extension)

Click the toolbar icon on any website to see its quality score (0–100) across 5 pillars:

- **Performance** (25 pts) — TTFB, page weight, third-party scripts
- **SEO** (25 pts) — title, meta, H1, robots, structured data
- **Mobile** (20 pts) — viewport tag, responsive readiness
- **Security** (15 pts) — HTTPS, mixed content, HSTS
- **AEO / Modernity** (15 pts) — JSON-LD, favicon, og:image, citability by AI

Powered by [fivedaylaunch.com/api/audit](https://fivedaylaunch.com/api/audit?url=stripe.com) — free, deterministic, no API key.

## Install (developer mode)

1. Download/clone this folder
2. Open `chrome://extensions/`
3. Toggle "Developer mode" on (top right)
4. Click "Load unpacked" → select this folder
5. Pin the icon to the toolbar
6. Visit any website → click the icon

## Privacy

The extension sends the **hostname** of the active tab to `fivedaylaunch.com/api/audit` to fetch the cached score. It does NOT send page content, browsing history, cookies, or personal data.

## Source

Audit logic: [github.com/Nareshdevelop/fdl-site-audit](https://github.com/Nareshdevelop/fdl-site-audit) (MIT)
