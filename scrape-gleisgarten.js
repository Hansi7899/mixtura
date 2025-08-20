// scrape-gleisgarten.js
const { chromium } = require('playwright');
const fs = require('fs');

const EVENTS_URL = 'https://www.gleisgarten.com/events';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/123 Safari/537.36',
        viewport: { width: 1366, height: 900 },
    });
    const page = await context.newPage();

    await page.goto(EVENTS_URL, { waitUntil: 'domcontentloaded' });

    // Let JS-driven content load
    await page.waitForLoadState('networkidle').catch(() => { });
    // Generic wait for links that look like event cards
    await page.waitForSelector('a[href*="/events/"]', { timeout: 20000 }).catch(() => { });

    const events = await page.evaluate(() => {
        // helper: extract background-image url if used instead of <img>
        const bgUrl = el => {
            if (!el) return null;
            const bg = getComputedStyle(el).backgroundImage;
            const m = bg && bg.match(/url\(["']?(.*?)["']?\)/i);
            return m ? m[1] : null;
        };

        const anchors = Array.from(document.querySelectorAll('a[href*="/events/"]'));
        const seen = new Set();
        const results = [];

        for (const a of anchors) {
            const url = new URL(a.href, location.origin).href;
            if (seen.has(url)) continue; // dedupe
            seen.add(url);

            // Try to limit to card-like elements (skip header/footer/social links)
            const card =
                a.closest('article, .w-dyn-item, .card, li, .event, .events_item, .events-card') || a;

            // Title
            const titleEl = card.querySelector('h1, h2, h3, [class*="title" i], [class*="name" i]');
            const title =
                (titleEl && titleEl.textContent.trim()) ||
                a.getAttribute('aria-label') ||
                a.title ||
                a.textContent.trim();

            // Date
            const dateEl = card.querySelector('time, [class*="date" i]');
            let date = (dateEl?.getAttribute('datetime') || dateEl?.textContent || '').trim();

            // Robust formatting: ensure a space before the first time (hh:mm)
            date = date.replace(/(\d{1,2}\s*\w{2,9}?)(\d{1,2}:\d{2})/, '$1 $2');
            // Description (optional, best-effort)
            const descEl = card.querySelector('p, [class*="description" i]');
            const description = (descEl?.textContent || '').trim();

            // Image (prefer <img>, fallback to background-image)
            const imgEl = card.querySelector('img') || a.querySelector('img');
            let image = imgEl ? (imgEl.currentSrc || imgEl.src) : (bgUrl(card) || bgUrl(a));
            if (image && image.startsWith('/')) image = new URL(image, location.origin).href;

            // Keep only plausible cards (must have a title)
            if (title) {
                results.push({ title, date, image, description, url });
            }
        }

        // Heuristic: remove obvious duplicates by title+url
        const unique = [];
        const keyset = new Set();
        for (const e of results) {
            const k = (e.title || '') + '|' + (e.url || '');
            if (!keyset.has(k)) {
                keyset.add(k);
                unique.push(e);
            }
        }
        return unique;
    });

    // Save into the same shape your site expects
    const out = { events };
    fs.writeFileSync('events.json', JSON.stringify(out, null, 2));
    console.log(`Saved ${events.length} events to events.json`);

    await browser.close();
})();
