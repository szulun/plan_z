import express from 'express';
import TradeLog from '../models/TradeLog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/trades - 取得目前使用者所有 trade log
router.get('/', auth, async (req, res) => {
  try {
    const trades = await TradeLog.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/trades - 新增一筆 trade log
router.post('/', auth, async (req, res) => {
  try {
    const trade = new TradeLog({ ...req.body, userId: req.user.id });
    await trade.save();
    res.status(201).json(trade);
  } catch (error) {
    res.status(400).json({ message: 'Create trade log failed', error: error.message });
  }
});

export default router; 