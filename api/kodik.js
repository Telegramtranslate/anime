// Vercel Serverless Function — прокси для Kodik API
// Решает проблему CORS навсегда
const https = require('https');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.KODIK_TOKEN || '56a768d08f43091901c44b54fe970049';
  const endpoint = req.query.endpoint || 'list';
  
  const params = { ...req.query };
  delete params.endpoint;
  params.token = token;
  
  const qs = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  
  const path = '/' + endpoint + '?' + qs;
  
  try {
    const data = await new Promise((resolve, reject) => {
      const opts = {
        hostname: 'kodik-api.com',
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      };
      
      const req2 = https.request(opts, (res2) => {
        let body = '';
        res2.on('data', chunk => body += chunk);
        res2.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch(e) { reject(new Error('Invalid JSON')); }
        });
      });
      req2.on('error', reject);
      req2.end();
    });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
