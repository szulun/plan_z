'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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

interface PortfolioPieChartProps {
  holdings: Stock[];
}

export default function PortfolioPieChart({ holdings }: PortfolioPieChartProps) {
  // 計算每個資產的市值和百分比
  const calculateAssetAllocation = () => {
    const stockAssets = holdings
      .filter(stock => stock.symbol !== 'CASH')
      .map(stock => {
        const currentPrice = stock.currentPrice ?? stock.purchasePrice;
        const marketValue = currentPrice * stock.quantity;
        return {
          label: stock.symbol,
          value: marketValue,
          name: stock.name,
        };
      });

    // 找出現金資產
    const cashAsset = holdings.find(stock => stock.symbol === 'CASH');
    const cashValue = cashAsset ? cashAsset.purchasePrice : 0;

    // 計算總資產
    const totalValue = stockAssets.reduce((sum, asset) => sum + asset.value, 0) + cashValue;

    // 計算百分比
    const stockPercentages = stockAssets.map(asset => ({
      ...asset,
      percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
    }));

    const cashPercentage = totalValue > 0 ? (cashValue / totalValue) * 100 : 0;

    return {
      stockAssets: stockPercentages,
      cashValue,
      cashPercentage,
      totalValue,
    };
  };

  const { stockAssets, cashValue, cashPercentage, totalValue } = calculateAssetAllocation();

  // 準備圖表資料
  const chartData = {
    labels: [
      ...stockAssets.map(asset => `${asset.label} (${asset.percentage.toFixed(1)}%)`),
      ...(cashValue > 0 ? [`Cash (${cashPercentage.toFixed(1)}%)`] : []),
    ],
    datasets: [
      {
        data: [
          ...stockAssets.map(asset => asset.value),
          ...(cashValue > 0 ? [cashValue] : []),
        ],
        backgroundColor: [
          '#FF6384', // 紅色
          '#36A2EB', // 藍色
          '#FFCE56', // 黃色
          '#4BC0C0', // 青色
          '#9966FF', // 紫色
          '#FF9F40', // 橙色
          '#FF6384', // 紅色
          '#36A2EB', // 藍色
          '#FFCE56', // 黃色
          '#4BC0C0', // 青色
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Portfolio Asset Allocation',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / totalValue) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage}%)`;
          },
        },
      },
    },
  };

  // 如果沒有資產，顯示空狀態
  if (totalValue === 0) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Asset Allocation</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>No assets to display</div>
            <div className="text-sm">Add stocks or cash to see your allocation</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio Asset Allocation</h3>
        <p className="text-sm text-gray-600">Total Portfolio Value: ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
      
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>

      {/* 詳細資產列表 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Asset Details</h4>
        <div className="space-y-2">
          {stockAssets.map((asset, index) => (
            <div key={asset.label + '-' + index} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                />
                <span className="font-medium">{asset.label}</span>
                <span className="text-gray-500 ml-1">({asset.name})</span>
              </div>
              <div className="text-right">
                <div className="font-medium">${asset.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="text-gray-500">{asset.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
          {cashValue > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[stockAssets.length] }}
                />
                <span className="font-medium">Cash</span>
              </div>
              <div className="text-right">
                <div className="font-medium">${cashValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="text-gray-500">{cashPercentage.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 