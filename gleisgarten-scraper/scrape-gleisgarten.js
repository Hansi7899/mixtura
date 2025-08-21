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

    await page.waitForLoadState('networkidle').catch(() => { });
    await page.waitForSelector('a[href*="/events/"]', { timeout: 20000 }).catch(() => { });

    const events = await page.evaluate(() => {
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
            if (seen.has(url)) continue;
            seen.add(url);

            const card =
                a.closest('article, .w-dyn-item, .card, li, .event, .events_item, .events-card') || a;

            // Title
            const titleEl = card.querySelector('h1, h2, h3, [class*="title" i], [class*="name" i]');
            const title =
                (titleEl && titleEl.textContent.trim()) ||
                a.getAttribute('aria-label') ||
                a.title ||
                a.textContent.trim();

            // Date & Time
            const dateBlock = card.querySelector('.events_slider_date-label-text-block, .events_slider_date-label-2rows');
            let date = '';
            let time = '';

            if (dateBlock) {
                const parts = Array.from(dateBlock.querySelectorAll('.events_slider_label-text'))
                    .map(el => el.textContent.trim())
                    .filter(Boolean);

                if (parts.length > 0) {
                    // Heuristic: if part looks like time (has ":" or "-"), treat as time
                    for (const p of parts) {
                        if (/\d{1,2}:\d{2}/.test(p) || p.includes('-')) {
                            time = time ? time + ' ' + p : p;
                        } else {
                            date = date ? date + ' ' + p : p;
                        }
                    }
                }
            }

            // Description
            const descEl = card.querySelector('p, [class*="description" i]');
            const description = (descEl?.textContent || '').trim();

            // Image
            const imgEl = card.querySelector('img') || a.querySelector('img');
            let image = imgEl ? (imgEl.currentSrc || imgEl.src) : (bgUrl(card) || bgUrl(a));
            if (image && image.startsWith('/')) image = new URL(image, location.origin).href;

            if (title) {
                results.push({ title, date, time, image, description, url });
            }
        }

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

    const out = { events };
    fs.writeFileSync('events.json', JSON.stringify(out, null, 2));
    console.log(`Saved ${events.length} events to events.json`);

    await browser.close();
})();
