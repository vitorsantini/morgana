const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4200;
const DIST = path.join(__dirname, 'dist/frontend/browser');
const INDEX = path.join(DIST, 'index.html');

const apiUrl = process.env.API_URL || 'https://seu-backend.railway.app/api';
const configScript = `<script>window.__APP_CONFIG__={apiUrl:'${apiUrl}'};</script>`;

const indexHtml = fs.readFileSync(INDEX, 'utf-8').replace('</head>', `${configScript}</head>`);

app.use(express.static(DIST, { index: false }));

// Angular routing — todas as rotas servem o index.html com config injetada
app.get('/{*splat}', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
