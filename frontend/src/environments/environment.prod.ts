// API_URL é injetada em runtime pelo server.js via window.__APP_CONFIG__.
// Configure a variável API_URL nas Variables do serviço Railway (frontend).
declare const window: Window & { __APP_CONFIG__?: { apiUrl?: string } };

export const environment = {
  production: true,
  apiUrl: window.__APP_CONFIG__?.apiUrl ?? 'https://seu-backend.railway.app/api',
};
