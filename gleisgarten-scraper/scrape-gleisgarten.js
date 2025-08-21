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
    await page.waitForSelector('a[href*="/events/"]', { timeout: 20000 }).catch(() => { });

    const events = await page.evaluate(() => {
        const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
        const isTimeText = (s) =>
            /\b\d{1,2}:\d{2}(?:\s*[–-]\s*\d{1,2}:\d{2})?\b/i.test(s) || // 18:00 or 18:00-19:30
            /\bab\s*\d{1,2}\s*Uhr\b/i.test(s) ||                         // ab 16 Uhr
            /\b\d{1,2}\s*Uhr\b/i.test(s);                                // 16 Uhr

        const bgUrl = (el) => {
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
            const title = normalize(titleEl?.innerText || a.getAttribute('aria-label') || a.title || a.innerText);

            // --- Date & Time ---
            const selectors = [
                'time',
                '[class*="date" i]',
                '[class*="day" i]',
                '[class*="weekday" i]',
                '[class*="when" i]',
                '[class*="time" i]',
                '[class*="hour" i]',
            ];

            const candidates = [];
            for (const sel of selectors) {
                card.querySelectorAll(sel).forEach((el) => {
                    const t = normalize(el.innerText || el.textContent);
                    if (t) candidates.push(t);
                });
            }

            let date = '';
            let time = '';

            if (candidates.length) {
                const uniq = Array.from(new Set(candidates));

                // If one part looks like time, split it cleanly
                const timePart = uniq.find(isTimeText);
                if (timePart) {
                    time = normalize(timePart);
                    date = normalize(uniq.filter((p) => p !== timePart).join(' '));
                } else {
                    // Otherwise everything is just a date
                    date = normalize(uniq.join(' '));
                }
            }

            // Description (best-effort)
            const descEl = card.querySelector('p, [class*="description" i]');
            const description = normalize(descEl?.innerText);

            // Image
            const imgEl = card.querySelector('img') || a.querySelector('img');
            let image = imgEl ? (imgEl.currentSrc || imgEl.src) : (bgUrl(card) || bgUrl(a));
            if (image && image.startsWith('/')) image = new URL(image, location.origin).href;

            if (title) {
                const event = { title, date, image, description, url };
                if (time) event.time = time; // only add if it exists
                results.push(event);
            }
        }

        // Deduplicate by title+url
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

    // Save JSON
    const out = { events };
    fs.writeFileSync('events.json', JSON.stringify(out, null, 2));
    console.log(`Saved ${events.length} events to events.json`);

    await browser.close();
})();
