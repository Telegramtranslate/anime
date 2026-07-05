// Vercel Serverless Function — прокси для Kodik API
// Решает проблему CORS: браузер -> Vercel -> Kodik API
const https = require('https');

module.exports = (req, res) => {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.KODIK_TOKEN || '56a768d08f43091901c44b54fe970049';
  const endpoint = req.query.endpoint || 'list';

  // Собираем параметры из query (исключая endpoint)
  const params = {};
  for (const key in req.query) {
    if (key !== 'endpoint') {
      params[key] = req.query[key];
    }
  }
  params.token = token;

  // Строим query string
  const qs = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])))
    .join('&');

  const path = '/' + endpoint + '?' + qs;
  let body = '';

  const options = {
    hostname: 'kodik-api.com',
    path: path,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  };

  const proxyReq = https.request(options, (proxyRes) => {
    proxyRes.on('data', (chunk) => body += chunk);
    proxyRes.on('end', () => {
      try {
        const json = JSON.parse(body);
        return res.status(200).json(json);
      } catch (e) {
        return res.status(502).json({ 
          error: 'Invalid response from Kodik API',
          body: body.substring(0, 200)
        });
      }
    });
  });

  proxyReq.on('error', (err) => {
    return res.status(502).json({ error: 'Proxy error: ' + err.message });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    return res.status(504).json({ error: 'Kodik API timeout' });
  });

  proxyReq.end();
};
