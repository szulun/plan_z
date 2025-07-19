const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// GET /api/insights
router.get('/', auth, async (req, res) => {
  try {
    // Mock insights data for now
    const insights = [
      {
        id: '1',
        type: 'patience',
        title: 'Patience Score',
        description: 'Your ability to hold through volatility',
        value: 75,
        date: new Date()
      },
      {
        id: '2',
        type: 'confidence',
        title: 'Confidence Index',
        description: 'Investment decision confidence',
        value: 82,
        date: new Date()
      }
    ];

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 