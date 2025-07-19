import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true,
    index: true
  },
  targetPrice: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  buyReason: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true,
    index: true
  },
  currentPrice: {
    type: Number,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Portfolio'
  },
  stocks: [stockSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Calculate portfolio metrics
portfolioSchema.methods.getMetrics = function() {
  const stocks = this.stocks;
  let totalValue = 0;
  let totalCost = 0;
  let totalGain = 0;

  stocks.forEach(stock => {
    const currentValue = (stock.currentPrice || stock.purchasePrice) * stock.quantity;
    const cost = stock.purchasePrice * stock.quantity;
    
    totalValue += currentValue;
    totalCost += cost;
    totalGain += (currentValue - cost);
  });

  return {
    totalValue,
    totalCost,
    totalGain,
    gainPercentage: totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  };
};

export default mongoose.model('Portfolio', portfolioSchema); 