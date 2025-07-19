'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

interface PortfolioPerformanceTableProps {
  holdings: Stock[];
}

export default function PortfolioPerformanceTable({ holdings }: PortfolioPerformanceTableProps) {
  // 計算每檔股票的損益資訊
  const calculateStockPerformance = (stock: Stock) => {
    const currentPrice = stock.currentPrice ?? stock.purchasePrice;
    const totalCost = stock.purchasePrice * stock.quantity;
    const totalValue = currentPrice * stock.quantity;
    const totalGain = totalValue - totalCost;
    const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity,
      avgBuyPrice: stock.purchasePrice,
      currentPrice,
      totalCost,
      totalValue,
      totalGain,
      gainPercentage,
      isPositive: totalGain >= 0,
    };
  };

  // 過濾掉現金，只顯示股票
  const stockHoldings = holdings.filter(stock => stock.symbol !== 'CASH');
  
  // 計算所有股票的損益資訊
  const performanceData = stockHoldings.map(calculateStockPerformance);
  
  // 計算總計
  const totals = performanceData.reduce((acc, stock) => ({
    totalCost: acc.totalCost + stock.totalCost,
    totalValue: acc.totalValue + stock.totalValue,
    totalGain: acc.totalGain + stock.totalGain,
  }), { totalCost: 0, totalValue: 0, totalGain: 0 });

  const totalGainPercentage = totals.totalCost > 0 ? (totals.totalGain / totals.totalCost) * 100 : 0;

  // 如果沒有股票，顯示空狀態
  if (performanceData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <div>No stocks to display</div>
            <div className="text-sm">Add stocks to see performance details</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-heading">Portfolio Performance</h3>
        <p className="text-sm text-gray-600">Detailed performance analysis for each holding</p>
      </div>

      {/* 總計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Cost</div>
          <div className="text-lg font-semibold">${totals.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-lg font-semibold">${totals.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Gain/Loss</div>
          <div className={`text-lg font-semibold ${totals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totals.totalGain >= 0 ? '+' : ''}${totals.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Return</div>
          <div className={`text-lg font-semibold ${totalGainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGainPercentage >= 0 ? '+' : ''}{totalGainPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 詳細表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Symbol</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Avg Buy Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Current Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Cost</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Value</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Gain/Loss</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Return %</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((stock, index) => (
              <tr key={stock.symbol + '-' + index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 font-semibold text-gray-900">{stock.symbol}</td>
                <td className="px-4 py-3 text-gray-700">{stock.name}</td>
                <td className="px-4 py-3 text-gray-700">{stock.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">${stock.avgBuyPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">${stock.currentPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">${stock.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-gray-700">${stock.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {stock.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`font-semibold ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.totalGain >= 0 ? '+' : ''}${stock.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.gainPercentage >= 0 ? '+' : ''}{stock.gainPercentage.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
            {/* 總計行 */}
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td className="px-4 py-3 font-bold text-gray-900" colSpan={5}>TOTAL</td>
              <td className="px-4 py-3 font-bold text-gray-900">${totals.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-3 font-bold text-gray-900">${totals.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {totals.totalGain >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`font-bold ${totals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.totalGain >= 0 ? '+' : ''}${totals.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`font-bold ${totalGainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainPercentage >= 0 ? '+' : ''}{totalGainPercentage.toFixed(2)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 績效摘要 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Winning Positions</div>
          <div className="text-2xl font-bold text-green-700">
            {performanceData.filter(stock => stock.isPositive).length}
          </div>
          <div className="text-xs text-green-600">
            {performanceData.length > 0 
              ? `${((performanceData.filter(stock => stock.isPositive).length / performanceData.length) * 100).toFixed(1)}% of portfolio`
              : '0% of portfolio'
            }
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Losing Positions</div>
          <div className="text-2xl font-bold text-red-700">
            {performanceData.filter(stock => !stock.isPositive).length}
          </div>
          <div className="text-xs text-red-600">
            {performanceData.length > 0 
              ? `${((performanceData.filter(stock => !stock.isPositive).length / performanceData.length) * 100).toFixed(1)}% of portfolio`
              : '0% of portfolio'
            }
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Best Performer</div>
          {performanceData.length > 0 ? (
            <>
              <div className="text-lg font-bold text-blue-700">
                {performanceData.reduce((best, current) => 
                  current.gainPercentage > best.gainPercentage ? current : best
                ).symbol}
              </div>
              <div className="text-xs text-blue-600">
                {performanceData.reduce((best, current) => 
                  current.gainPercentage > best.gainPercentage ? current : best
                ).gainPercentage.toFixed(2)}% return
              </div>
            </>
          ) : (
            <div className="text-sm text-blue-600">No stocks</div>
          )}
        </div>
      </div>
    </div>
  );
} 