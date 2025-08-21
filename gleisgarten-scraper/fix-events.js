// fix-events.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('events.json', 'utf8'));

const timeRe = /\b\d{1,2}:\d{2}(?:\s*[–-]\s*\d{1,2}:\d{2})?\b|\bab\s*\d{1,2}\s*Uhr\b|\b\d{1,2}\s*Uhr\b/i;

data.events = data.events.map(e => {
    const s = (e.date || '').replace(/\s+/g, ' ').trim();
    const m = s.match(timeRe);
    if (m) {
        return {
            ...e,
            date: s.replace(m[0], ' ').replace(/\s+/g, ' ').trim(),
            time: m[0].replace(/\s+/g, ' ').trim(),
        };
    }
    return { ...e, time: e.time || '' };
});

fs.writeFileSync('events.json', JSON.stringify(data, null, 2));
console.log('Cleaned events.json');
