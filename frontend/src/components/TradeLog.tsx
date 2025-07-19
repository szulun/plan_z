'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Calendar, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react';

export interface TradeRecord {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  date: Date;
  price: number;
  quantity: number;
  reason: string;
  targetPrice?: number;
  stopLoss?: number;
  notes: string;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  decisionFactors: {
    fundamental: boolean;
    technical: boolean;
    sentiment: boolean;
    other: boolean;
  };
  outcome?: 'profit' | 'loss' | 'breakeven' | 'ongoing';
  actualReturn?: number;
  lessons: string;
}

interface TradeLogProps {
  holdings: Stock[];
  trades?: TradeRecord[];
  onAddTrade?: (trade: Omit<TradeRecord, 'id'>) => void;
}

interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  targetPrice?: number;
  notes?: string;
  buyReason?: string;
  sector?: string;
  purchaseDate: Date;
  lastUpdated?: Date;
}

export default function TradeLog({ holdings, trades: externalTrades, onAddTrade }: TradeLogProps) {
  const [internalTrades, setInternalTrades] = useState<TradeRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'profit' | 'loss'>('all');

  // 從 holdings 生成初始交易記錄
  useEffect(() => {
    if (externalTrades) return; // 外部狀態時不自動生成
    const initialTrades: TradeRecord[] = holdings
      .filter(stock => stock.symbol !== 'CASH')
      .map(stock => ({
        id: stock.id,
        symbol: stock.symbol,
        action: 'buy' as const,
        date: new Date(stock.purchaseDate),
        price: stock.purchasePrice,
        quantity: stock.quantity,
        reason: stock.buyReason || 'Initial purchase',
        targetPrice: stock.targetPrice,
        stopLoss: stock.purchasePrice * 0.9, // 預設 10% 止損
        notes: stock.notes || '',
        marketSentiment: 'neutral' as const,
        decisionFactors: {
          fundamental: true,
          technical: false,
          sentiment: false,
          other: false,
        },
        outcome: 'ongoing' as const,
        actualReturn: stock.currentPrice ? 
          ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100 : undefined,
        lessons: '',
      }));
    setInternalTrades(initialTrades);
  }, [holdings, externalTrades]);

  // 使用外部或內部 trades 狀態
  const trades = externalTrades ?? internalTrades;
  const setTrades = externalTrades ? () => {} : setInternalTrades;
  const handleAddTrade = onAddTrade ?? ((trade: Omit<TradeRecord, 'id'>) => {
    const newTrade: TradeRecord = {
      ...trade,
      id: `trade-${Date.now()}-${Math.random()}`,
    };
    setInternalTrades(prev => [...prev, newTrade]);
    setShowAddModal(false);
  });

  // 計算統計數據
  const calculateStats = () => {
    const completedTrades = trades.filter(trade => trade.outcome !== 'ongoing');
    const profitableTrades = completedTrades.filter(trade => trade.outcome === 'profit');
    const losingTrades = completedTrades.filter(trade => trade.outcome === 'loss');
    
    const totalReturn = trades.reduce((sum, trade) => {
      return sum + (trade.actualReturn || 0);
    }, 0);
    
    const avgReturn = completedTrades.length > 0 ? totalReturn / completedTrades.length : 0;
    const winRate = completedTrades.length > 0 ? (profitableTrades.length / completedTrades.length) * 100 : 0;
    
    return {
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      avgReturn,
      totalReturn,
    };
  };

  const stats = calculateStats();

  // 過濾交易記錄
  const filteredTrades = trades.filter(trade => {
    switch (filter) {
      case 'buy': return trade.action === 'buy';
      case 'sell': return trade.action === 'sell';
      case 'profit': return trade.outcome === 'profit';
      case 'loss': return trade.outcome === 'loss';
      default: return true;
    }
  });

  const handleEditTrade = (trade: TradeRecord) => {
    setEditingTrade(trade);
  };

  const handleUpdateTrade = (updatedTrade: Omit<TradeRecord, 'id'>) => {
    if (editingTrade) {
      const tradeWithId: TradeRecord = {
        ...updatedTrade,
        id: editingTrade.id,
      };
      setTrades(trades.map(trade => trade.id === editingTrade.id ? tradeWithId : trade));
      setEditingTrade(null);
    }
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(trades.filter(trade => trade.id !== tradeId));
  };

  console.log('trades', trades);

  return (
    <div className="space-y-6">
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Trades</div>
              <div className="text-2xl font-bold text-gray-900 font-heading">{stats.totalTrades}</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Win Rate</div>
              <div className="text-2xl font-bold text-green-600 font-heading">{stats.winRate.toFixed(1)}%</div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Avg Return</div>
              <div className={`text-2xl font-bold ${stats.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'} font-heading`}>
                {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
              </div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600 font-heading">{stats.completedTrades}</div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 控制欄 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'buy', 'sell', 'profit', 'loss'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' && 'All Trades'}
              {filterType === 'buy' && 'Buys'}
              {filterType === 'sell' && 'Sells'}
              {filterType === 'profit' && 'Profitable'}
              {filterType === 'loss' && 'Losing'}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      </div>

      {/* 交易記錄列表 */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        trade.action === 'buy' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trade.symbol}</div>
                        <div className="text-sm text-gray-500 capitalize">{trade.action}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={trade.reason}>
                      {trade.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      trade.outcome === 'profit' ? 'bg-green-100 text-green-800' :
                      trade.outcome === 'loss' ? 'bg-red-100 text-red-800' :
                      trade.outcome === 'breakeven' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trade.outcome || 'Ongoing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trade.actualReturn !== undefined ? (
                      <span className={`text-sm font-medium ${
                        trade.actualReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.actualReturn >= 0 ? '+' : ''}{trade.actualReturn.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTrade(trade)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium">No trades found</div>
              <div className="text-sm">Add your first trade to start tracking your decisions</div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Trade Modal */}
      {(showAddModal || editingTrade) && (
        <TradeModal
          trade={editingTrade}
          onSave={editingTrade ? handleUpdateTrade : handleAddTrade}
          onClose={() => {
            setShowAddModal(false);
            setEditingTrade(null);
          }}
        />
      )}
    </div>
  );
}

// Trade Modal Component
interface TradeModalProps {
  trade?: TradeRecord | null;
  onSave: (trade: Omit<TradeRecord, 'id'>) => void;
  onClose: () => void;
}

function TradeModal({ trade, onSave, onClose }: TradeModalProps) {
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    action: trade?.action || 'buy',
    date: trade?.date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    price: trade?.price || 0,
    quantity: trade?.quantity || 0,
    reason: trade?.reason || '',
    targetPrice: trade?.targetPrice || 0,
    stopLoss: trade?.stopLoss || 0,
    notes: trade?.notes || '',
    marketSentiment: trade?.marketSentiment || 'neutral',
    decisionFactors: trade?.decisionFactors || {
      fundamental: false,
      technical: false,
      sentiment: false,
      other: false,
    },
    outcome: trade?.outcome || 'ongoing',
    actualReturn: trade?.actualReturn || 0,
    lessons: trade?.lessons || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: new Date(formData.date),
      targetPrice: formData.targetPrice || undefined,
      stopLoss: formData.stopLoss || undefined,
      actualReturn: formData.actualReturn || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
          {trade ? 'Edit Trade' : 'Add New Trade'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({...formData, action: e.target.value as 'buy' | 'sell'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Sentiment</label>
              <select
                value={formData.marketSentiment}
                onChange={(e) => setFormData({...formData, marketSentiment: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buy/Sell Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="What was your reasoning for this trade?"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) => setFormData({...formData, targetPrice: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss (optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.stopLoss}
                onChange={(e) => setFormData({...formData, stopLoss: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decision Factors</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['fundamental', 'technical', 'sentiment', 'other'] as const).map((factor) => (
                <label key={factor} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.decisionFactors[factor]}
                    onChange={(e) => setFormData({
                      ...formData,
                      decisionFactors: {
                        ...formData.decisionFactors,
                        [factor]: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{factor}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about this trade..."
            />
          </div>
          
          {formData.action === 'sell' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({...formData, outcome: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="profit">Profit</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Breakeven</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.actualReturn}
                  onChange={(e) => setFormData({...formData, actualReturn: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15.5 for 15.5%"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lessons Learned</label>
            <textarea
              value={formData.lessons}
              onChange={(e) => setFormData({...formData, lessons: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="What did you learn from this trade?"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {trade ? 'Update Trade' : 'Add Trade'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 