// Vercel Serverless Function — прокси для Kodik API
// Решает проблему CORS: браузер → Vercel → Kodik API
const https = require('https');

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.KODIK_TOKEN || '56a768d08f43091901c44b54fe970049';
  const endpoint = req.query.endpoint || 'list';

  // Собираем параметры
  const allParams = {};
  for (const key in req.query) {
    if (key !== 'endpoint') {
      allParams[key] = String(req.query[key]);
    }
  }
  allParams.token = token;

  // Тело запроса (form-urlencoded)
  const postBody = Object.keys(allParams)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(allParams[k]))
    .join('&');

  const options = {
    hostname: 'kodik-api.com',
    path: '/' + endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postBody)
    },
    timeout: 20000
  };

  let responseBody = '';

  const proxyReq = https.request(options, (proxyRes) => {
    proxyRes.on('data', chunk => responseBody += chunk);
    proxyRes.on('end', () => {
      try {
        const json = JSON.parse(responseBody);
        return res.status(200).json(json);
      } catch (e) {
        return res.status(502).json({
          error: 'Invalid response from Kodik',
          preview: responseBody.substring(0, 300)
        });
      }
    });
  });

  proxyReq.on('error', (err) => {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'Proxy: ' + err.message }));
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.statusCode = 504;
    return res.end(JSON.stringify({ error: 'Kodik timeout' }));
  });

  proxyReq.write(postBody);
  proxyReq.end();
};
