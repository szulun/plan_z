const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// GET /api/stocks/quote/:symbol
router.get('/quote/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    if (!quote) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch stock data', 
      error: error.message 
    });
  }
});

module.exports = router; 