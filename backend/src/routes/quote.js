import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Finnhub API key not set' });
  }
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Finnhub 回傳', symbol, data); // <--- 這一行很重要
    if (typeof data.c === 'number') {
      return res.json({ price: data.c });
    }
    return res.status(404).json({ error: 'No price found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router; 