const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());

// GET events
app.get('/events.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.json'));
});

// POST updated events
app.post('/events.json', (req, res) => {
    const events = req.body;
    fs.writeFile('events.json', JSON.stringify(events, null, 2), (err) => {
        if (err) return res.status(500).send({ error: 'Failed to save events' });
        res.send({ success: true });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
