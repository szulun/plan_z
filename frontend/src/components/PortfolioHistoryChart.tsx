'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface PortfolioHistoryChartProps {
  holdings: Stock[];
}

interface HistoryDataPoint {
  date: string;
  portfolioValue: number;
  sp500Value: number;
}

export default function PortfolioHistoryChart({ holdings }: PortfolioHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<'1w' | '1m' | '3m' | '6m' | '1y' | 'all'>('1m');
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // 計算投資組合的實際開始日期
  const getPortfolioStartDate = () => {
    const stockHoldings = holdings.filter(stock => stock.symbol !== 'CASH');
    if (stockHoldings.length === 0) {
      return new Date(); // 如果沒有股票，從今天開始
    }
    
    // 找到最早的購買日期
    const earliestDate = new Date(Math.min(...stockHoldings.map(stock => 
      new Date(stock.purchaseDate).getTime()
    )));
    
    return earliestDate;
  };

  // 生成歷史數據（投資組合從實際持有開始，S&P 500 可以更長）
  const generateHistoryData = (range: string) => {
    const now = new Date();
    const portfolioStartDate = getPortfolioStartDate();
    const data: HistoryDataPoint[] = [];
    
    let days: number;
    switch (range) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      case 'all': days = 365; break;
      default: days = 30;
    }

    // 計算當前投資組合總值
    const currentPortfolioValue = holdings.reduce((total, stock) => {
      if (stock.symbol === 'CASH') {
        return total + stock.purchasePrice;
      } else {
        const currentPrice = stock.currentPrice ?? stock.purchasePrice;
        return total + (currentPrice * stock.quantity);
      }
    }, 0);

    // 計算投資組合持有天數
    const portfolioDays = Math.ceil((now.getTime() - portfolioStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 生成數據點
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 檢查這個日期是否在投資組合開始日期之後
      const isAfterPortfolioStart = date >= portfolioStartDate;
      
      let portfolioValue: number;
      if (isAfterPortfolioStart) {
        // 投資組合開始後的數據：基於實際持有時間生成
        const daysSinceStart = Math.ceil((date.getTime() - portfolioStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const maxDays = Math.min(daysSinceStart, portfolioDays);
        
        // 模擬投資組合價值變化
        const volatility = 0.02; // 2% 日波動率
        const randomChange = (Math.random() - 0.5) * volatility;
        portfolioValue = currentPortfolioValue * Math.pow(1 + randomChange, maxDays);
      } else {
        // 投資組合開始前：顯示為 0 或 null
        portfolioValue = 0;
      }
      
      // S&P 500 數據：可以顯示更長的歷史
      const sp500BaseValue = 4500; // 假設 S&P 500 基準值
      const sp500Volatility = 0.015; // 1.5% 日波動率
      const sp500RandomChange = (Math.random() - 0.5) * sp500Volatility;
      const sp500Value = sp500BaseValue * Math.pow(1 + sp500RandomChange, days - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: Math.max(0, portfolioValue),
        sp500Value: Math.max(0, sp500Value),
      });
    }
    
    return data;
  };

  useEffect(() => {
    setLoading(true);
    // 模擬 API 調用延遲
    setTimeout(() => {
      const data = generateHistoryData(timeRange);
      setHistoryData(data);
      setLoading(false);
    }, 500);
  }, [timeRange, holdings]);

  // 計算績效指標（只考慮投資組合實際持有期間）
  const calculatePerformanceMetrics = () => {
    if (historyData.length < 2) return null;
    
    // 過濾掉投資組合價值為 0 的數據點
    const portfolioData = historyData.filter(point => point.portfolioValue > 0);
    
    if (portfolioData.length < 2) return null;
    
    const firstValue = portfolioData[0].portfolioValue;
    const lastValue = portfolioData[portfolioData.length - 1].portfolioValue;
    const totalReturn = ((lastValue - firstValue) / firstValue) * 100;
    
    // 計算年化報酬率
    const days = portfolioData.length - 1;
    const annualizedReturn = Math.pow(lastValue / firstValue, 365 / days) - 1;
    
    // 計算最大回撤
    let maxDrawdown = 0;
    let peak = firstValue;
    
    for (const point of portfolioData) {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      }
      const drawdown = (peak - point.portfolioValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return {
      totalReturn,
      annualizedReturn: annualizedReturn * 100,
      maxDrawdown: maxDrawdown * 100,
      portfolioDays: portfolioData.length,
    };
  };

  const metrics = calculatePerformanceMetrics();
  const portfolioStartDate = getPortfolioStartDate();

  // 準備圖表數據
  const chartData = {
    labels: historyData.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Portfolio Value',
        data: historyData.map(point => point.portfolioValue > 0 ? point.portfolioValue : null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        spanGaps: true, // 允許空值間隔
      },
      {
        label: 'S&P 500',
        data: historyData.map(point => point.sp500Value),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Portfolio Performance History',
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
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null) return `${label}: No data`;
            return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value ($)',
        },
        ticks: {
          callback: function(value: any) {
            if (value === null) return '';
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading performance data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">Portfolio Performance History</h3>
        
        {/* 投資組合開始日期提示 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Portfolio Start Date:</strong> {portfolioStartDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {metrics && (
              <span className="ml-2">
                ({metrics.portfolioDays} days of data)
              </span>
            )}
          </div>
        </div>
        
        {/* 時間範圍選擇器 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['1w', '1m', '3m', '6m', '1y', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '1w' && '1 Week'}
              {range === '1m' && '1 Month'}
              {range === '3m' && '3 Months'}
              {range === '6m' && '6 Months'}
              {range === '1y' && '1 Year'}
              {range === 'all' && 'All Time'}
            </button>
          ))}
        </div>

        {/* 績效指標 */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Return</div>
              <div className={`text-2xl font-bold ${metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 font-medium">Max Drawdown</div>
              <div className="text-2xl font-bold text-red-600">
                -{metrics.maxDrawdown.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 圖表 */}
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>

      {/* 圖表說明 */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Blue line:</strong> Your portfolio value (starts from your first purchase)
        </p>
        <p>
          <strong>Red line:</strong> S&P 500 index for comparison (shows full time range)
        </p>
      </div>
    </div>
  );
} 