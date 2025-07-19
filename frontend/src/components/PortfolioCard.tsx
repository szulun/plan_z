'use client';

import { motion } from 'framer-motion';
import { Stock } from '@/types';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioCardProps {
  stocks: Stock[];
}

export default function PortfolioCard({ stocks }: PortfolioCardProps) {
  const totalValue = stocks.reduce((sum, stock) => {
    const currentValue = (stock.currentPrice || stock.purchasePrice) * stock.quantity;
    return sum + currentValue;
  }, 0);

  const totalCost = stocks.reduce((sum, stock) => {
    return sum + (stock.purchasePrice * stock.quantity);
  }, 0);

  const totalGain = totalValue - totalCost;
  const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
          Portfolio Overview
        </h2>
        <div className="flex items-center space-x-3">
          {gainPercentage >= 0 ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-green-100 rounded-full"
            >
              <TrendingUp className="w-7 h-7 text-green-600" />
            </motion.div>
          ) : (
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-7 h-7 text-red-600" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-display font-semibold tracking-widest uppercase">Total Value</p>
          <p className="text-4xl font-mono font-bold text-gray-900 tracking-tight">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-display font-semibold tracking-widest uppercase">Total Gain/Loss</p>
          <div className="flex items-center space-x-4">
            <p className={`text-4xl font-mono font-bold tracking-tight ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
            </p>
            <p className={`text-lg font-display font-semibold ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalGain.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 