'use client';

import { motion } from 'framer-motion';
import { Stock } from '@/types';
import { TrendingUp, TrendingDown, Target, BookOpen, Edit, Trash2 } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onEdit?: (stock: Stock) => void;
  onDelete?: (stockId: string) => void;
}

export default function StockCard({ stock, onEdit, onDelete }: StockCardProps) {
  const currentPrice = stock.currentPrice || stock.purchasePrice;
  const totalValue = currentPrice * stock.quantity;
  const totalCost = stock.purchasePrice * stock.quantity;
  const gain = totalValue - totalCost;
  const gainPercentage = (gain / totalCost) * 100;

  const isTargetReached = stock.targetPrice && currentPrice >= stock.targetPrice;

  const handleEdit = () => {
    console.log('Edit button clicked for:', stock.symbol); // 調試日誌
    onEdit?.(stock);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for:', stock.symbol); // 調試日誌
    onDelete?.(stock.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {stock.targetPrice && (
            <div className={`p-1 rounded-full ${isTargetReached ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Target className={`w-4 h-4 ${isTargetReached ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
          )}
          {stock.notes && (
            <div className="p-1 rounded-full bg-blue-100">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{stock.quantity}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg Price:</span>
          <span className="font-medium">${stock.purchasePrice}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current:</span>
          <span className="font-medium">${currentPrice}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Value:</span>
          <span className="font-medium">${totalValue.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Gain/Loss:</span>
          <div className="flex items-center space-x-1">
            {gainPercentage >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleEdit}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
        >
          <Edit className="w-3 h-3" />
          <span>Edit</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  );
} 