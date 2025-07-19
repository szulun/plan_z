'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';

interface AddStockFormProps {
  onAdd: (stock: any) => void;
  onClose: () => void;
}

export default function AddStockForm({ onAdd, onClose }: AddStockFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    targetPrice: '',
    notes: '',
    buyReason: ''
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // 模擬搜索結果
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' }
    ].filter(stock => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(mockResults);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !formData.buyReason.trim()) return;

    const newStock = {
      id: Date.now().toString(),
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: new Date(formData.purchaseDate),
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
      notes: formData.notes,
      buyReason: formData.buyReason,
      currentPrice: parseFloat(formData.purchasePrice), // 暫時設為購買價格
      lastUpdated: new Date()
    };

    onAdd(newStock);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. 搜尋/選股區塊 */}
      <div className="mb-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Search Stock</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter stock symbol or company name"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        {/* 搜索結果 */}
        {searchResults.length > 0 && (
          <div className="space-y-1 mt-2">
            {searchResults.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => setSelectedStock(stock)}
                className={`w-full p-2 text-left rounded-lg border transition-colors text-xs ${
                  selectedStock?.symbol === stock.symbol
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold text-gray-900">{stock.symbol}</span>
                <span className="ml-2 text-gray-600">{stock.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* 分隔線 */}
      <hr className="my-2" />
      {/* 2. 基本資訊分組 */}
      <div>
        <div className="text-xs font-bold text-gray-700 mb-1">Basic Info</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="10"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="150.00"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Date</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
        </div>
      </div>
      {/* 分隔線 */}
      <hr className="my-2" />
      {/* 3. 進階資訊分組 */}
      <div>
        <div className="text-xs font-bold text-gray-700 mb-1">Advanced (Optional)</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetPrice}
              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              placeholder="180.00"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Buy Reason</label>
            <input
              type="text"
              value={formData.buyReason}
              onChange={(e) => setFormData({ ...formData, buyReason: e.target.value })}
              placeholder="Why did you buy this stock?"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>
      {/* 選股資訊顯示 */}
      {selectedStock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-gray-50 rounded-lg mt-2 text-xs"
        >
          <div className="font-semibold text-gray-900 mb-1">Selected Stock</div>
          <div className="text-gray-600">
            <span className="font-bold">Symbol:</span> {selectedStock.symbol} &nbsp;|
            <span className="font-bold ml-2">Name:</span> {selectedStock.name}
          </div>
        </motion.div>
      )}
      {/* 按鈕區塊 */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
          disabled={!selectedStock || !formData.quantity || !formData.purchasePrice}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </form>
  );
} 