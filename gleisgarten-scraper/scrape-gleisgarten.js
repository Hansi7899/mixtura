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
        const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();

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

            // --- Date & Time extraction ---
            const dateEl = card.querySelector(
                '[class*="date" i], [class*="day" i], time, [class*="when" i], [class*="hour" i]'
            );

            let date = '';
            let time = '';

            if (dateEl) {
                // Replace <br> with pipe, then split
                const raw = dateEl.innerHTML.replace(/<br\s*\/?>/gi, '|');
                const parts = raw.split('|').map(s => normalize(s)).filter(Boolean);

                if (parts.length === 1) {
                    // If glued -> try to split date and time
                    const match = parts[0].match(/^(.*?)(\d{1,2}:\d{2}.*)$/);
                    if (match) {
                        date = match[1].trim();
                        time = match[2].trim();
                    } else {
                        date = parts[0];
                    }
                } else {
                    // Two lines: first = date, second = time
                    date = parts[0];
                    time = parts[1];
                }
            }

            // Description
            const descEl = card.querySelector('p, [class*="description" i]');
            const description = normalize(descEl?.innerText);

            // Image
            const imgEl = card.querySelector('img') || a.querySelector('img');
            let image = imgEl ? (imgEl.currentSrc || imgEl.src) : (bgUrl(card) || bgUrl(a));
            if (image && image.startsWith('/')) image = new URL(image, location.origin).href;

            if (title) {
                results.push({ title, date, time, image, description, url });
            }
        }

        // Deduplicate
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

    // --- Ensure consistent JSON structure ---
    const cleanEvents = events.map(ev => ({
        title: ev.title || "",
        date: ev.date || "",
        time: ev.time || "",
        image: ev.image || "",
        description: ev.description || "",
        url: ev.url || ""
    }));

    const out = { events: cleanEvents };
    fs.writeFileSync('events.json', JSON.stringify(out, null, 2));
    console.log(`Saved ${cleanEvents.length} events to events.json`);

    await browser.close();
})();
