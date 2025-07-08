const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/zapin', async (req, res) => {
  console.log('Received POST /api/zapin', req.body);
  const { api_key, sender, number, message } = req.body;
  if (!api_key || !sender || !number || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const zapinUrl = `https://zapin.my.id/send-message?api_key=${encodeURIComponent(api_key)}&sender=${encodeURIComponent(sender)}&number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}`;
  try {
    const zapinRes = await fetch(zapinUrl);
    const data = await zapinRes.json();
    console.log('Zapin API response:', data);
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Zapin proxy running on http://localhost:${PORT}/api/zapin`);
});