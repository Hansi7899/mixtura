// scrape-gleisgarten.js
const { chromium } = require('playwright');
const fs = require('fs');
const { Translate } = require('@google-cloud/translate').v2;

const EVENTS_URL = 'https://www.gleisgarten.com/events';

// Initialize Google Translate
const translate = new Translate({
    projectId: 'your-project-id',
    keyFilename: './google-translate-key.json'
});

async function translateText(text) {
    try {
        const [translation] = await translate.translate(text, {
            from: 'de',
            to: 'en'
        });
        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text if translation fails
    }
}

function formatDateTime(dateText) {
    const monthMap = {
        'Jan': 'Jän',
        'Feb': 'Feb',
        'Mar': 'Mär',
        'Apr': 'Apr',
        'May': 'Mai',
        'Jun': 'Jun',
        'Jul': 'Jul',
        'Aug': 'Aug',
        'Sep': 'Sep',
        'Oct': 'Okt',
        'Nov': 'Nov',
        'Dec': 'Dez'
    };

    let formatted = dateText.trim().replace(/\s+/g, ' ');

    if (formatted.includes('.')) {
        // Handle time formats like "18:00-19:30" or "ab 16 Uhr"
        if (formatted.match(/\d{2}:\d{2}/) || formatted.includes('ab')) {
            return formatted;
        }

        // Handle recurring events like "01.-29. Sep"
        if (formatted.match(/\d+\s+[A-Za-z]+\s+01-29\.\d{2}\./)) {
            const month = formatted.match(/\s+([A-Za-z]+)\s+/)[1];
            formatted = `01.-29. ${month}`;
        }
        // Handle month ranges like "01.-31. Aug"
        else if (formatted.match(/\d+\.\-\d+\.\s+[A-Za-z]+$/)) {
            return formatted; // Already in correct format
        }
        // Handle cases like "23 Aug 16.-23.08."
        else if (formatted.match(/\d+\s+[A-Za-z]+\s+\d+\.\-\d+\.\d{2}\./)) {
            formatted = formatted.replace(/\d+\s+([A-Za-z]+)\s+(\d+)\.\-(\d+)\.\d{2}\./,
                (_, month, start, end) => `${start}.-${end}. ${month}`);
        }
        // Handle full date formats "31 Aug 01.08.-31.08."
        else if (formatted.match(/\d+\s+[A-Za-z]+\s+\d{2}\.\d{2}\.\-(\d{2})\.\d{2}\./)) {
            formatted = formatted.replace(/\d+\s+([A-Za-z]+)\s+(\d{2})\.\d{2}\.\-(\d{2})\.\d{2}\./,
                (_, month, start, end) => `${start}.-${end}. ${month}`);
        }
    }

    // Convert English months to German
    Object.entries(monthMap).forEach(([eng, ger]) => {
        formatted = formatted.replace(new RegExp(eng, 'gi'), ger);
    });

    return formatted;
}

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

    const rawEvents = await page.evaluate(() => {
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
            let dateTime = '';

            if (dateBlock) {
                // Get all text content from date block and combine
                dateTime = Array.from(dateBlock.querySelectorAll('.events_slider_label-text'))
                    .map(el => el.textContent.trim())
                    .filter(Boolean)
                    .join(' ');
            }

            // Description
            const descEl = card.querySelector('p, [class*="description" i]');
            const description = (descEl?.textContent || '').trim();

            // Image
            const imgEl = card.querySelector('img') || a.querySelector('img');
            let image = imgEl ? (imgEl.currentSrc || imgEl.src) : (bgUrl(card) || bgUrl(a));
            if (image && image.startsWith('/')) image = new URL(image, location.origin).href;

            if (title) {
                results.push({
                    title,
                    dateTime,
                    image,
                    description,
                    url
                });
            }
        }

        // Filter unique events first
        const unique = [];
        const keyset = new Set();
        for (const e of results) {
            const k = (e.title || '') + '|' + (e.dateTime || '');  // Include dateTime in key
            if (!keyset.has(k)) {
                keyset.add(k);
                unique.push(e);
            }
        }

        // Return only first 5 events
        return unique.slice(0, 5);
    });

    // Format dates and translate after page evaluation
    const events = await Promise.all(rawEvents.map(async event => ({
        ...event,
        dateTime: event.dateTime ? formatDateTime(event.dateTime) : '',
        title: await translateText(event.title),
        description: event.description ? await translateText(event.description) : ''
    })));

    const out = { events };
    fs.writeFileSync('events.json', JSON.stringify(out, null, 2));
    console.log(`Saved ${events.length} translated events to events.json`);

    await browser.close();
})();
