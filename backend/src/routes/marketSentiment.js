// routes/marketSentiment.js
import express from 'express';
import axios from 'axios';

const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const router = express.Router();

async function fetchAlphaQuote(symbol) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
  const res = await axios.get(url);
  const data = res.data['Global Quote'];
  return {
    price: parseFloat(data['05. price']),
    change: parseFloat(data['09. change']),
    changePercent: parseFloat(data['10. change percent']),
  };
}

async function fetchAlphaHistory(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_KEY}&outputsize=compact`;
  const res = await axios.get(url);
  const series = res.data['Time Series (Daily)'];
  if (!series) return [];
  return Object.values(series).map(day => parseFloat(day['4. close']));
}

let spyYTDCache = null;
let spyYTDCacheDate = null;

router.get('/spy-ytd', async (req, res) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // 如果今天已經查過，直接回傳快取
  if (spyYTDCache && spyYTDCacheDate === today) {
    return res.json(spyYTDCache);
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const thisYear = new Date().getFullYear();
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=full&apikey=${apiKey}`;
    const { data } = await axios.get(url);

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return res.status(500).json({ error: 'No SPY data', detail: data });
    }

    // 找到今年第一個交易日和最新一個交易日
    const dates = Object.keys(timeSeries).sort();
    const startDate = dates.find(date => date.startsWith(`${thisYear}-`));
    const endDate = dates[dates.length - 1];

    if (!startDate || !endDate) {
      return res.status(500).json({ error: 'No valid date found' });
    }

    const startPrice = parseFloat(timeSeries[startDate]['4. close']);
    const endPrice = parseFloat(timeSeries[endDate]['4. close']);
    const ytd = ((endPrice - startPrice) / startPrice) * 100;

    const result = { ytd, startDate, endDate };
    spyYTDCache = result;
    spyYTDCacheDate = today;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SPY YTD', detail: err.message });
  }
});

export default router;