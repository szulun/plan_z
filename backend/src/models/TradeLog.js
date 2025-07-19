import mongoose from 'mongoose';

const tradeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: { type: String, required: true },
  action: { type: String, enum: ['buy', 'sell'], required: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  targetPrice: { type: Number },
  stopLoss: { type: Number },
  notes: { type: String },
  marketSentiment: { type: String, enum: ['bullish', 'bearish', 'neutral'], default: 'neutral' },
  decisionFactors: {
    fundamental: { type: Boolean, default: false },
    technical: { type: Boolean, default: false },
    sentiment: { type: Boolean, default: false },
    other: { type: Boolean, default: false }
  },
  outcome: { type: String, enum: ['profit', 'loss', 'breakeven', 'ongoing'] },
  actualReturn: { type: Number },
  lessons: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('TradeLog', tradeLogSchema); 