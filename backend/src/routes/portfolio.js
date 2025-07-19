import express from 'express';
import auth from '../middleware/auth.js';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

// GET /api/portfolio
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting portfolio for user:', req.user.id);
    
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      console.log('Portfolio not found, creating default portfolio');
      // 如果沒有投資組合，創建一個預設的空投資組合
      const defaultPortfolio = new Portfolio({
        userId: req.user.id,
        name: 'My Portfolio',
        stocks: [],
        cashBalance: 0
      });
      await defaultPortfolio.save();
      
      const metrics = defaultPortfolio.getMetrics();
      return res.json({
        portfolio: defaultPortfolio,
        metrics
      });
    }

    const metrics = portfolio.getMetrics();
    
    res.json({
      portfolio,
      metrics
    });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/portfolio - 新增或更新投資組合
router.post('/', auth, async (req, res) => {
  try {
    const { name, stocks, cashBalance } = req.body;
    
    console.log('=== Portfolio POST Request ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Stocks type:', typeof stocks);
    console.log('Stocks is array:', Array.isArray(stocks));
    console.log('Stocks length:', stocks?.length);

    // 防呆：如果 stocks 存在但不是 array，直接回錯誤
    if (stocks !== undefined && !Array.isArray(stocks)) {
      console.log('ERROR: Stocks is not an array');
      return res.status(400).json({ message: 'Stocks must be an array' });
    }

    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    console.log('Existing portfolio found:', !!portfolio);
    if (portfolio) {
      console.log('Current portfolio data:', {
        name: portfolio.name,
        stocksCount: portfolio.stocks?.length || 0,
        cashBalance: portfolio.cashBalance
      });
    }

    if (portfolio) {
      // 更新現有投資組合 - 只更新有提供的欄位
      if (name !== undefined && name !== null && name !== '') {
        portfolio.name = name;
        console.log('Updated name to:', name);
      }
      
      // 允許空陣列更新（這可能是清空股票的正常操作）
      if (Array.isArray(stocks)) {
        portfolio.stocks = stocks;
        console.log('Updated stocks, new count:', stocks.length);
      }
      
      // 更新現金餘額
      if (cashBalance !== undefined && cashBalance !== null) {
        portfolio.cashBalance = Number(cashBalance) || 0;
        console.log('Updated cash balance to:', portfolio.cashBalance);
      }
      
      console.log('Updating existing portfolio');
    } else {
      // 創建新投資組合
      portfolio = new Portfolio({
        userId: req.user.id,
        name: name || 'My Portfolio',
        stocks: Array.isArray(stocks) ? stocks : [],
        cashBalance: Number(cashBalance) || 0
      });
      
      console.log('Creating new portfolio with:', {
        name: portfolio.name,
        stocksCount: portfolio.stocks.length,
        cashBalance: portfolio.cashBalance
      });
    }

    console.log('About to save portfolio...');
    const savedPortfolio = await portfolio.save();
    console.log('Portfolio saved successfully with ID:', savedPortfolio._id);
    
    const metrics = portfolio.getMetrics();
    console.log('Metrics calculated successfully');

    console.log('=== Portfolio POST Success ===');

    res.json({
      portfolio: savedPortfolio,
      metrics
    });
  } catch (error) {
    console.error('=== Portfolio POST Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /api/portfolio/cash - 專門更新現金餘額
router.put('/cash', auth, async (req, res) => {
  try {
    const { cashBalance } = req.body;
    
    console.log('Updating cash balance for user:', req.user.id, 'to:', cashBalance);

    if (cashBalance === undefined || cashBalance === null) {
      return res.status(400).json({ message: 'Cash balance is required' });
    }

    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      // 如果沒有投資組合，創建一個新的
      portfolio = new Portfolio({
        userId: req.user.id,
        name: 'My Portfolio',
        stocks: [],
        cashBalance: Number(cashBalance) || 0
      });
    } else {
      portfolio.cashBalance = Number(cashBalance) || 0;
    }

    await portfolio.save();
    const metrics = portfolio.getMetrics();

    res.json({
      portfolio,
      metrics
    });
  } catch (error) {
    console.error('Error updating cash balance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/portfolio/stocks - 專門更新股票持倉
router.put('/stocks', auth, async (req, res) => {
  try {
    const { stocks } = req.body;
    
    console.log('Updating stocks for user:', req.user.id, 'stocks count:', stocks?.length || 0);

    if (!Array.isArray(stocks)) {
      return res.status(400).json({ message: 'Stocks must be an array' });
    }

    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      // 如果沒有投資組合，創建一個新的
      portfolio = new Portfolio({
        userId: req.user.id,
        name: 'My Portfolio',
        stocks: stocks,
        cashBalance: 0
      });
    } else {
      portfolio.stocks = stocks;
    }

    await portfolio.save();
    const metrics = portfolio.getMetrics();

    res.json({
      portfolio,
      metrics
    });
  } catch (error) {
    console.error('Error updating stocks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/portfolio/stocks/:symbol - 刪除特定股票
router.delete('/stocks/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    console.log('Deleting stock:', symbol, 'for user:', req.user.id);

    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // 移除指定的股票
    portfolio.stocks = portfolio.stocks.filter(stock => stock.symbol !== symbol);
    
    await portfolio.save();
    const metrics = portfolio.getMetrics();

    res.json({
      portfolio,
      metrics
    });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;