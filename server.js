// server.js (version minimale pour servir dist/)
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback SPA (si tu as du routing côté client)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});