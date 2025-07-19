'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { getIdToken, onAuthStateChanged, signOut, User } from 'firebase/auth';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import AddStockForm from '@/components/AddStockForm';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import PortfolioPerformanceTable from '@/components/PortfolioPerformanceTable';
import PortfolioHistoryChart from '@/components/PortfolioHistoryChart';
import TradeLog from '@/components/TradeLog';
import { Stock } from '@/types';
import { Plus, Trash2, Home as HomeIcon, PieChart, TrendingUp, BookOpen, Link2, Mail as MailIcon } from 'lucide-react';
import { FearGreedCalculator } from '@/utils/fearGreedCalculator';
import IndexCard from '@/components/IndexCard';
import ToolCard from '@/components/ToolCard';
import { Dancing_Script, Sacramento } from 'next/font/google';
import toast, { Toaster } from 'react-hot-toast';
import type { TradeRecord } from '@/components/TradeLog';

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  weight: ['400', '700'],
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  variable: '--font-sacramento',
  weight: ['400'],
  display: 'swap',
});

// Fetch current price from Alpha Vantage
async function fetchStockPrice(symbol: string): Promise<number | null> {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const price = data['Global Quote']?.['05. price'];
    return price ? parseFloat(price) : null;
  } catch {
    return null;
  }
}

// 改為 fetch 後端 API
async function fetchSPYYTDReturn(): Promise<{ ytd: number, startDate: string, endDate: string }> {
  try {
    const res = await fetch('/api/market-sentiment/spy-ytd');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return {
      ytd: data.ytd,
      startDate: data.startDate,
      endDate: data.endDate
    };
  } catch {
    return { ytd: 10, startDate: '', endDate: '' };
  }
}

// Calculate portfolio summary
function getPortfolioSummary(holdings: Stock[], sp500Percent = 10) {
  let totalValue = 0;
  let totalCost = 0;
  let stockValue = 0;
  let stockCost = 0;
  let hasStock = false;
  holdings.forEach(stock => {
    if (stock.symbol === 'CASH') {
      totalValue += stock.purchasePrice;
      // 不計入 totalCost
    } else {
      const value = (stock.currentPrice ?? stock.purchasePrice) * stock.quantity;
      totalValue += value;
      totalCost += stock.purchasePrice * stock.quantity;
      stockValue += value;
      stockCost += stock.purchasePrice * stock.quantity;
      hasStock = true;
    }
  });
  const totalGain = stockValue - stockCost;
  let gainPercent = 0;
  let vsSP500 = 0;
  if (hasStock && stockCost > 0) {
    gainPercent = (totalGain / stockCost) * 100;
    vsSP500 = gainPercent - sp500Percent;
  } else {
    gainPercent = 0;
    vsSP500 = -sp500Percent;
  }
  return {
    totalValue,
    totalGain,
    gainPercent,
    vsSP500,
  };
}

// 小指數卡片元件
const SmallIndexCard = ({ label, value, color, link, source, imgWhenZero }: { label: string; value: number | string; color: string; link: string; source: string; imgWhenZero?: string }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow hover:shadow-md transition cursor-pointer group mx-1"
    style={{ minWidth: 100 }}
    title={`View details on ${source}`}
  >
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`text-lg font-bold ${color} group-hover:underline`}>
      {value === 0 && imgWhenZero
        ? <img src={imgWhenZero} alt={label} style={{ width: 60, height: 'auto', margin: '0 auto' }} />
        : value}
    </div>
    <div className="text-[10px] text-gray-400">{source}</div>
  </a>
);

// Overview cards
const OverviewCards = ({ summary, fearGreedValue, breadthValue, nymoValue, customValue, user, spyYTD, spyYTDStart, spyYTDEnd, holdings }: { summary: { totalValue: number; totalGain: number; gainPercent: number; vsSP500: number; hasStock?: boolean }; fearGreedValue: number; breadthValue: number; nymoValue?: number; customValue?: number; user: any; spyYTD: number; spyYTDStart: string; spyYTDEnd: string; holdings: Stock[] }) => {
  const calculator = new FearGreedCalculator();
  const fakeMarketData = {
    currentVix: 18.5,
    vixMA20: 20.2,
    spyChange: 1.2,
    vixChange: -5.3,
    volume: 1000000
  };
  const fgResult = calculator.calculateFearGreedIndex(fakeMarketData);

  function getPlanBLevel(value: number | undefined) {
    if (value === undefined) return { text: '', color: '' };
    if (value < 15) return { text: '🟢 Aggressive Mode', color: 'text-green-600' };
    if (value < 50) return { text: '🟡 Normal Mode', color: 'text-yellow-500' };
    if (value < 70) return { text: '🟠 Reduce Mode', color: 'text-orange-500' };
    return { text: '🔴 Defensive Mode', color: 'text-red-500' };
  }
  const planBLevel = getPlanBLevel(customValue ?? 0);

  return (
    <div className="mb-2">
      <div className="flex justify-center gap-1 mb-3">
        
        <IndexCard
          title="NYMO"
          value={nymoValue}
          source="StockCharts"
          link="https://stockcharts.com/h-sc/ui?s=$NYMO"
        />
        <IndexCard
          title="Market Breadth"
          value={breadthValue}
          source="Trading Logic"
          link="https://www.trading-logic.com/index.html"
        />
        <IndexCard
          title="Fear & Greed"
          value={fearGreedValue}
          source="CNN"
          link="https://www.cnn.com/markets/fear-and-greed"
        />
        <IndexCard
          title="Plan B index"
          value={customValue}
          source={<span className={planBLevel.color}>{planBLevel.text}</span>}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
          <div className="text-gray-500 text-sm mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-bold">
            ${summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-yellow-700 bg-yellow-50 rounded-lg px-3 py-1 text-sm font-semibold">
            Cash Balance: ${holdings.find(h => h.symbol === 'CASH')?.purchasePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 0}
          </div>
        </div>
        {/* Total Gain/Loss */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
          <div className="text-gray-500 text-sm mb-1">Total Gain/Loss</div>
          <div className={`text-2xl font-bold ${summary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.totalGain >= 0 ? '+' : ''}${summary.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className={summary.gainPercent >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
            {summary.gainPercent >= 0 ? '+' : ''}{summary.gainPercent.toFixed(2)}%
          </div>
        </div>
        {/* vs S&P 500 or S&P 500 YTD */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
          {summary.hasStock !== false && summary.hasStock !== undefined ? (
            <>
              <div className="text-gray-500 text-sm mb-1">vs S&amp;P 500</div>
              <div className={`text-2xl font-bold ${summary.vsSP500 >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{summary.vsSP500 >= 0 ? '+' : ''}{summary.vsSP500.toFixed(2)}%</div>
              <div className="text-blue-600 text-sm">{summary.vsSP500 >= 0 ? 'Outperformed' : 'Underperformed'}</div>
            </>
          ) : (
            spyYTDStart && spyYTDEnd ? (
              <>
                <div className="text-gray-500 text-sm mb-1">S&amp;P 500 YTD Return</div>
                <div className="text-2xl font-bold text-blue-600">{spyYTD >= 0 ? '+' : ''}{Number(spyYTD).toFixed(2)}%</div>
                <div className="text-xs text-gray-400 mt-1">
                  {spyYTDStart && spyYTDEnd
                    ? `${spyYTDStart.slice(5)} ~ ${spyYTDEnd.slice(5)}`
                    : ''}
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm">Loading S&amp;P 500 YTD...</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

function parseGoogleSheetJSON(raw: string) {
  const json = JSON.parse(raw.replace(/^[^\(]+\(|\);?$/g, ''));
  const rows = json.table.rows;
  return rows.map((row: any) => row.c.map((cell: any) => cell?.v ?? ''));
}

// 刪除 MarketDataFromSheet 相關程式碼與插入點

const sidebarItems = [
  { key: 'portfolio', label: 'My Portfolio', icon: <HomeIcon size={20} /> },
  { key: 'analysis', label: 'Portfolio Analysis', icon: <PieChart size={20} /> },
  { key: 'performance', label: 'Performance Tracking', icon: <TrendingUp size={20} /> },
  { key: 'insider', label: 'Trade Log', icon: <BookOpen size={20} /> },
  { key: 'links', label: 'Recommended Links', icon: <Link2 size={20} /> },
  { key: 'feedback', label: 'Feedback', icon: <MailIcon size={20} /> },
];

const CASH_ASSET = {
  id: 'cash',
  symbol: 'CASH',
  name: 'Cash',
  quantity: 1,
  purchasePrice: 0,
  currentPrice: 1,
  targetPrice: 1,
  notes: '',
  purchaseDate: new Date(), // 補上 purchaseDate
};

// Yahoo Finance quote fetcher（直接寫死 backend URL）
async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const url = `http://localhost:5001/api/quote/${symbol}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('fetchYahooPrice', symbol, data);
    return data.price ?? null;
  } catch (e) {
    console.error('fetchYahooPrice error', symbol, e);
    return null;
  }
}

// 新增 fetchTrades function
async function fetchTrades(token: string) {
  const res = await fetch('/api/trades', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  // 後端回傳的 _id 轉成 id，確保 React key 唯一
  return data.map((t: any) => ({ ...t, id: t._id, date: new Date(t.date) }));
}

export default function Home() {
  const [tab, setTab] = useState<'portfolio' | 'analysis' | 'performance' | 'insider' | 'links' | 'feedback'>('portfolio');
  const [portfolioTab, setPortfolioTab] = useState<'holdings' | 'watching'>('holdings');
  const [holdings, setHoldings] = useState<Stock[]>([]);
  const [portfolioLoaded, setPortfolioLoaded] = useState(false);
  const [watching, setWatching] = useState<Stock[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashInput, setCashInput] = useState(0);
  const [sheetIndicators, setSheetIndicators] = useState<{cnn?: string, nymo?: string, breadth?: string, custom?: string}>({});
  const [spyYTD, setSpyYTD] = useState<number>(10);
  const [spyYTDStart, setSpyYTDStart] = useState<string>('');
  const [spyYTDEnd, setSpyYTDEnd] = useState<string>('');
  const [fearGreedValue, setFearGreedValue] = useState<number | null>(null);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // 1. 新增狀態
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetReachedStock, setTargetReachedStock] = useState<Stock | null>(null);
  const [targetReachedQueue, setTargetReachedQueue] = useState<Stock[]>([]);
  const [sellStock, setSellStock] = useState<Stock | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({ quantity: 0, price: 0, date: '', reason: '' });
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  // 取得 trade log
  useEffect(() => {
    if (!token) return;
    fetchTrades(token).then(setTrades);
  }, [token]);

  // 新增 trade log
  const handleAddTrade = async (trade: Omit<TradeRecord, 'id'>) => {
    if (!token) return;
    await fetch('/api/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(trade)
    });
    fetchTrades(token).then(setTrades);
  };

  // 新增 checkTargetReached 函數
  const checkTargetReached = () => {
    const allStocks = [...holdings, ...watching];
    const reached = allStocks.filter(
      s => s.symbol !== 'CASH' && s.targetPrice && s.currentPrice && s.currentPrice >= s.targetPrice
    );
    // 避免重複彈同一筆（根據 id）
    setTargetReachedQueue(prev => {
      const prevIds = prev.map(s => s.id);
      const newOnes = reached.filter(s => !prevIds.includes(s.id));
      return [...prev, ...newOnes];
    });
  };

  // 1. 監聽 Firebase 登入狀態，並取得 JWT token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const firebaseToken = await getIdToken(firebaseUser);
          // 取得 JWT token
          const response = await fetch('/api/auth/firebase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseToken,
              email: firebaseUser.email,
              name: firebaseUser.displayName
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('token', data.token);
          } else {
            setToken(null);
            localStorage.removeItem('token');
          }
        } catch (e) {
          setToken(null);
          localStorage.removeItem('token');
        }
      } else {
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. token 準備好時 fetch portfolio
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          setLoading(false);
          setPortfolioLoaded(true);
          return;
        }
        const data = await res.json();
        if (data.portfolio && Array.isArray(data.portfolio.stocks)) {
          const newHoldings = data.portfolio.stocks.length > 0
            ? data.portfolio.stocks.map((stock: any, idx: number) => ({
                ...stock,
                id: stock.id || stock._id || `${stock.symbol}-${idx}-${Date.now()}`
              }))
            : [];
          setHoldings(newHoldings);
        }
      } catch (e) {
        // ignore
      }
      setLoading(false);
      setPortfolioLoaded(true);
    };
    fetchPortfolio();
  }, [token]);

  // 3. holdings 變動時自動同步到 MongoDB（token 準備好才同步）
  const isFirstSync = useRef(true);
  const isPriceUpdate = useRef(false);
  const lastSyncData = useRef<string>('');
  useEffect(() => {
    if (!token) return;
    if (!portfolioLoaded) return; // 只有 portfolio 載入後才允許同步
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    if (isPriceUpdate.current) {
      isPriceUpdate.current = false;
      return;
    }
    // 只有 holdings 有有效資料時才同步
    if (!holdings || holdings.length === 0 || holdings.every(h => h.symbol === 'CASH' && (!h.purchasePrice || h.purchasePrice === 0))) {
      return;
    }
    const currentData = JSON.stringify(holdings);
    if (currentData === lastSyncData.current) {
      return;
    }
    const syncPortfolio = async () => {
      try {
        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: 'My Portfolio', stocks: holdings })
        });
        if (response.ok) {
          lastSyncData.current = currentData;
        }
      } catch (e) {}
    };
    syncPortfolio();
  }, [holdings, token, portfolioLoaded]);

  useEffect(() => {
    fetchSPYYTDReturn().then(res => {
      console.log('SPY YTD API 回傳：', res);
      setSpyYTD(res.ytd);
      setSpyYTDStart(res.startDate);
      setSpyYTDEnd(res.endDate);
    });
  }, []);

  // 進入頁面時只抓一次 current price
  useEffect(() => {
    if (holdings.length === 0) return;
    const updateAllPrices = async () => {
      setIsRefreshing(true);
      const updated = await Promise.all(
        holdings.map(async (stock) => {
          if (stock.symbol === 'CASH') return stock;
          const price = await fetchYahooPrice(stock.symbol);
          console.log('update price', stock.symbol, price);
          return { ...stock, currentPrice: price ?? stock.purchasePrice };
        })
      );
      console.log('setHoldings', updated);
      setHoldings(updated);
      setIsRefreshing(false);
    };
    updateAllPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 手動刷新按鈕
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      holdings.map(async (stock) => {
        if (stock.symbol === 'CASH') return stock;
        const price = await fetchYahooPrice(stock.symbol);
        return { ...stock, currentPrice: price ?? stock.purchasePrice };
      })
    );
    setHoldings(updated);
    setIsRefreshing(false);
    setTimeout(checkTargetReached, 0);
  };

  // Auto fetch current price
  useEffect(() => {
    async function updatePrices(list: Stock[], setList: (s: Stock[]) => void) {
      const updated = await Promise.all(
        list.map(async (stock) => {
          const price = await fetchStockPrice(stock.symbol);
          return { ...stock, currentPrice: price ?? stock.currentPrice, lastUpdated: new Date() };
        })
      );
      setList(updated);
    }
    if (holdings.length > 0) updatePrices(holdings, setHoldings);
    if (watching.length > 0) updatePrices(watching, setWatching);
  }, []);

  // Google Sheets 指標自動抓取（直接抓 B2, B3, B4, B5）
  useEffect(() => {
    const fetchData = () => {
      const url = `https://docs.google.com/spreadsheets/d/1IsW0mGmFZKegdBA44QK2TXmA5jTTX13RJRqfplsUWXw/gviz/tq?tqx=out:json&gid=0&rand=${Date.now()}`;
      fetch(url)
        .then(res => res.text())
        .then(raw => {
          const rows = parseGoogleSheetJSON(raw);
          setSheetIndicators({
            cnn: rows[1]?.[1] ?? '',   // B2
            nymo: rows[2]?.[1] ?? '',  // B3
            breadth: rows[3]?.[1] ?? '', // B4
            custom: rows[4]?.[1] ?? '',  // B5
          });
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Add stock
  const handleAddStock = (newStock: Stock) => {
    if (portfolioTab === 'holdings') {
      setHoldings(prev => {
        const updated = [...prev, {
          ...newStock,
          id: newStock.id || `${newStock.symbol}-${Date.now()}-${Math.random()}`
        }];
        setTimeout(checkTargetReached, 0);
        return updated;
      });
      // 自動同步到 Trade Log
      handleAddTrade({
        symbol: newStock.symbol,
        action: 'buy',
        date: new Date(newStock.purchaseDate),
        price: newStock.purchasePrice,
        quantity: newStock.quantity,
        reason: newStock.buyReason || 'Initial purchase',
        targetPrice: newStock.targetPrice,
        stopLoss: undefined,
        notes: newStock.notes || '',
        marketSentiment: 'neutral',
        decisionFactors: {
          fundamental: true,
          technical: false,
          sentiment: false,
          other: false,
        },
        outcome: 'ongoing',
        actualReturn: undefined,
        lessons: '',
      });
    } else {
      setWatching(prev => {
        const updated = [...prev, {
          ...newStock,
          id: newStock.id || `${newStock.symbol}-${Date.now()}-${Math.random()}`,
          quantity: 0,
          purchasePrice: 0,
          purchaseDate: new Date()
        }];
        setTimeout(checkTargetReached, 0);
        return updated;
      });
    }
    setShowAddModal(false);
    toast.success('已新增 Added!');
  };

  // Delete stock
  const handleDeleteStock = (stockId: string, type: 'holdings' | 'watching') => {
    if (type === 'holdings') {
      setHoldings(prev => {
        const stockToDelete = prev.find(stock => stock.id === stockId);
        const updated = prev.filter(stock => stock.id !== stockId);
        setTimeout(checkTargetReached, 0);
        // 新增 TradeLog 紀錄
        if (stockToDelete && token) {
          fetch('/api/trades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              symbol: stockToDelete.symbol,
              action: 'sell',
              date: new Date(),
              price: stockToDelete.currentPrice || stockToDelete.purchasePrice,
              quantity: stockToDelete.quantity,
              reason: 'Manual delete',
              targetPrice: stockToDelete.targetPrice,
              stopLoss: undefined,
              notes: stockToDelete.notes || '',
              marketSentiment: 'neutral',
              decisionFactors: {
                fundamental: false,
                technical: false,
                sentiment: false,
                other: true,
              },
              outcome: undefined,
              actualReturn: stockToDelete.currentPrice && stockToDelete.purchasePrice ? ((stockToDelete.currentPrice - stockToDelete.purchasePrice) / stockToDelete.purchasePrice) * 100 : undefined,
              lessons: '',
            })
          }).then(() => fetchTrades(token).then(setTrades));
        }
        return updated;
      });
    } else {
      setWatching(prev => {
        const updated = prev.filter(stock => stock.id !== stockId);
        setTimeout(checkTargetReached, 0);
        return updated;
      });
    }
    toast.success('已刪除！');
  };

  // 編輯現金
  const handleEditCash = () => {
    const cash = holdings.find(h => h.symbol === 'CASH');
    console.log('Editing cash, current cash:', cash);
    setCashInput(cash ? cash.purchasePrice : 0);
    setShowCashModal(true);
  };
  const handleSaveCash = () => {
    console.log('Saving cash, new amount:', cashInput);
    setHoldings(prev => {
      const others = prev.filter(h => h.symbol !== 'CASH');
      const newHoldings = [
        { ...CASH_ASSET, purchasePrice: cashInput, purchaseDate: new Date() }, // 補上 purchaseDate
        ...others
      ];
      console.log('New holdings after cash update:', newHoldings);
      return newHoldings;
    });
    setShowCashModal(false);
  };

  // Portfolio summary
  const summary = getPortfolioSummary(holdings, spyYTD);

  // Table
  const StockTable = ({ list, type }: { list: Stock[]; type: 'holdings' | 'watching' }) => {
    // last updated
    const lastUpdated = list.reduce((latest, stock) => {
      if (stock.lastUpdated && (!latest || new Date(stock.lastUpdated) > new Date(latest))) {
        return stock.lastUpdated;
      }
      return latest;
    }, undefined as Date | undefined);
    return (
      <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200 p-6">
        {lastUpdated && (
          <div className="text-right text-xs text-gray-500 mb-2">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-center">Symbol</th>
              <th className="px-3 py-2 text-center">Name</th>
              {type === 'holdings' && <th className="px-3 py-2 text-center">Quantity</th>}
              {type === 'holdings' && <th className="px-3 py-2 text-center">Buy Price</th>}
              <th className="px-3 py-2 text-center">Current Price</th>
              <th className="px-3 py-2 text-center">Target Price</th>
              <th className="px-3 py-2 text-center">Notes</th>
              <th className="px-3 py-2 text-center">Alert</th>
              <th className="px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((stock) => (
              <tr key={stock.id} className="border-b">
                <td className="px-3 py-2 font-semibold">{stock.symbol}</td>
                <td className="px-3 py-2">{stock.name}</td>
                {type === 'holdings' && <td className="px-3 py-2">{stock.quantity}</td>}
                {type === 'holdings' && <td className="px-3 py-2">${stock.purchasePrice}</td>}
                <td className="px-3 py-2">{stock.currentPrice ? `$${stock.currentPrice}` : '-'}</td>
                <td className="px-3 py-2">{stock.targetPrice ? `$${stock.targetPrice}` : '-'}</td>
                <td className="px-3 py-2">{stock.notes}</td>
                <td className="px-3 py-2 text-center align-middle">
                  {stock.currentPrice && stock.targetPrice && stock.currentPrice >= stock.targetPrice ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm shadow-sm whitespace-nowrap">
                      <span className="text-base">🎯</span>
                      Target reached!
                    </span>
                  ) : (
                    // 這裡加一個透明的佔位符
                    <span className="opacity-0 select-none">Target reached!</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => { setEditStock(stock); setShowEditModal(true); }}
                    className="text-gray-600 hover:text-blue-600 mr-2"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3a2 2 0 002 2h3" /></svg>
                  </button>
                  {type === 'holdings' && (
                    <button
                      onClick={() => {
                        setSellStock(stock);
                        setSellForm({ quantity: stock.quantity, price: stock.currentPrice || stock.purchasePrice, date: new Date().toISOString().slice(0, 10), reason: '' });
                        setShowSellModal(true);
                      }}
                      className="text-red-500 hover:text-red-700 mr-2 font-bold"
                      title="Sell"
                    >
                      Sell
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteStock(stock.id, type)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={type === 'holdings' ? 9 : 8} className="text-center text-gray-400 py-4">
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // useEffect（補齊 buy trades）必須在 return/loading 判斷之前
  useEffect(() => {
    if (!holdings || holdings.length === 0) return;
    setTrades(prev => {
      // 只在 trades 為空時補 buy trades，否則不動
      if (prev.length === 0) {
        const newBuys = holdings.filter(h => h.symbol !== 'CASH').map(h => ({
          id: `trade-${Date.now()}-${Math.random()}`,
          symbol: h.symbol,
          action: 'buy' as const,
          date: h.purchaseDate instanceof Date ? h.purchaseDate : new Date(h.purchaseDate),
          price: h.purchasePrice,
          quantity: h.quantity,
          reason: h.buyReason || 'Initial purchase',
          targetPrice: h.targetPrice,
          stopLoss: undefined,
          notes: h.notes || '',
          marketSentiment: 'neutral' as const,
          decisionFactors: {
            fundamental: true,
            technical: false,
            sentiment: false,
            other: false,
          },
          outcome: 'ongoing' as const,
          actualReturn: undefined,
          lessons: '',
        }));
        return [...prev, ...newBuys];
      }
      return prev;
    });
  }, [holdings]);

  // loading 狀態時顯示 loading
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }

  // TradeLog Ref for adding trades from outside
  // const tradeLogRef = useRef<any>(null); // Removed as per edit hint

  return (
    <Layout>
      <Toaster />
      {/* Header 加登入/登出按鈕 */}
      <div className="flex items-center justify-between">
        <Header />
        {user ? (
          <button
            onClick={async () => {
              await signOut(auth);
              router.push('/');
            }}
            className="ml-auto px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="ml-auto px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            Login
          </button>
        )}
      </div>
      
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 border-r shadow flex flex-col py-8 px-4">
            {/* 這裡不再有 Plan B 標題 */}
            {/* 只保留分頁按鈕 */}
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key as typeof tab)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 mb-2 rounded-xl transition font-semibold ${
                  tab === item.key
                    ? 'bg-gray-900 text-white shadow'
                    : 'text-gray-900 hover:bg-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* 根據 tab 顯示內容 */}
            {tab === 'portfolio' && (
              <>
                {/* 三個大卡片 */}
                <OverviewCards
                  summary={summary}
                  fearGreedValue={sheetIndicators.cnn ? Number(sheetIndicators.cnn) : 0}
                  breadthValue={sheetIndicators.breadth ? Number(sheetIndicators.breadth) : 0}
                  nymoValue={sheetIndicators.nymo ? Number(sheetIndicators.nymo) : 0}
                  customValue={sheetIndicators.custom ? Number(sheetIndicators.custom) : 0}
                  user={user}
                  spyYTD={spyYTD}
                  spyYTDStart={spyYTDStart}
                  spyYTDEnd={spyYTDEnd}
                  holdings={holdings}
                />
                {/* Holdings / Watching 切換 */}
                <div className="flex items-center gap-8 mb-4">
                  {/* 主操作區塊 */}
                  <div className="flex items-center gap-4">
                    <button
                      className={`h-12 px-7 rounded-full text-base font-inter font-bold transition shadow-md hover:shadow-xl hover:scale-105 duration-150
      ${portfolioTab === 'holdings' ? 'bg-gray-700 text-white' : 'bg-gray-500 text-white hover:bg-gray-700'}`}
                      onClick={() => setPortfolioTab('holdings')}
                    >
                      Holdings
                    </button>
                    <button
                      className={`h-12 px-7 rounded-full text-base font-inter font-bold transition shadow-md hover:shadow-xl hover:scale-105 duration-150
      ${portfolioTab === 'watching' ? 'bg-gray-700 text-white' : 'bg-gray-500 text-white hover:bg-gray-700'}`}
                      onClick={() => setPortfolioTab('watching')}
                    >
                      Watching
                    </button>
                    <button
                      onClick={handleManualRefresh}
                      className="h-12 px-7 rounded-full text-base font-inter font-bold transition shadow-md hover:shadow-xl hover:scale-105 duration-150 bg-gray-500 text-white hover:bg-gray-700"
                      disabled={isRefreshing}
                      style={{ minWidth: 140 }}
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
                    </button>
                  </div>
                  {/* 分隔線 */}
                  <div className="h-10 w-px bg-gray-300 mx-2" />
                  {/* 新增/現金區塊 */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleEditCash}
                      className="h-12 px-7 rounded-full text-base font-inter font-bold transition shadow-md hover:shadow-xl hover:scale-105 duration-150 bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                    >
                      Edit Cash
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="h-12 px-7 rounded-full text-base font-inter font-bold flex items-center space-x-2 transition shadow-md hover:shadow-xl hover:scale-105 duration-150 bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                    >
                      <Plus className="w-5 h-5 text-gray-900" />
                      <span>Add Stock</span>
                    </button>
                  </div>
                </div>

                {/* Holdings/Watching 表格 */}
                {portfolioTab === 'holdings' ? (
                  <>
                    <StockTable list={holdings.filter(h => h.symbol !== 'CASH')} type="holdings" />
                  </>
                ) : (
                  <StockTable list={watching} type="watching" />
                )}

                {/* Add Stock Modal */}
                <Modal
                  isOpen={showAddModal}
                  onClose={() => setShowAddModal(false)}
                  title={portfolioTab === 'holdings' ? 'Add to Holdings' : 'Add to Watching'}
                >
                  <AddStockForm
                    onAdd={handleAddStock}
                    onClose={() => setShowAddModal(false)}
                  />
                </Modal>

                {/* Edit Stock Modal */}
                {showEditModal && editStock && (
                  <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Stock">
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (portfolioTab === 'holdings') {
                          setHoldings(prev => prev.map(s => s.id === editStock.id ? { ...editStock } : s));
                        } else {
                          setWatching(prev => prev.map(s => s.id === editStock.id ? { ...editStock } : s));
                        }
                        setShowEditModal(false);
                        toast.success('已更新 Updated!');
                        setTimeout(checkTargetReached, 0);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold mb-1">Quantity</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={editStock.quantity}
                          onChange={e => setEditStock({ ...editStock, quantity: Number(e.target.value) })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Buy Price</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={editStock.purchasePrice}
                          onChange={e => setEditStock({ ...editStock, purchasePrice: Number(e.target.value) })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Target Price</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={editStock.targetPrice || ''}
                          onChange={e => setEditStock({ ...editStock, targetPrice: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Notes</label>
                        <input type="text" className="w-full border rounded px-3 py-2" value={editStock.notes || ''}
                          onChange={e => setEditStock({ ...editStock, notes: e.target.value })} />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                        <button type="button" className="flex-1 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowEditModal(false)}>Cancel</button>
                      </div>
                    </form>
                  </Modal>
                )}

                {/* Edit Cash Modal */}
                <Modal isOpen={showCashModal} onClose={() => setShowCashModal(false)} title="Edit Cash">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cash Amount</label>
                    <input
                      type="number"
                      value={cashInput}
                      onChange={e => setCashInput(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min={0}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCashModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCash}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </Modal>

                {/* Sell Modal */}
                {showSellModal && sellStock && (
                  <Modal isOpen={showSellModal} onClose={() => setShowSellModal(false)} title={`Sell ${sellStock.symbol}`}>
                    {/* 顯示買入理由提醒 */}
                    {sellStock.buyReason && (
                      <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                        <span className="font-bold">你當初買入的理由：</span>{sellStock.buyReason}
                      </div>
                    )}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        // 更新持股
                        setHoldings(prev => {
                          return prev.map(s =>
                            s.id === sellStock.id
                              ? { ...s, quantity: s.quantity - sellForm.quantity }
                              : s
                          ).filter(s => s.quantity > 0 || s.symbol === 'CASH');
                        });
                        // 自動判斷 outcome
                        const buyPrice = sellStock.purchasePrice;
                        const sellPrice = sellForm.price;
                        let outcome: 'profit' | 'loss' | 'breakeven' = 'breakeven';
                        if (sellPrice > buyPrice) outcome = 'profit';
                        else if (sellPrice < buyPrice) outcome = 'loss';
                        else outcome = 'breakeven';
                        const actualReturn = buyPrice ? ((sellPrice - buyPrice) / buyPrice) * 100 : undefined;
                        const tradeObj = {
                          symbol: sellStock.symbol,
                          action: 'sell' as const,
                          date: new Date(sellForm.date),
                          price: sellForm.price,
                          quantity: sellForm.quantity,
                          reason: sellForm.reason,
                          targetPrice: sellStock.targetPrice,
                          stopLoss: undefined,
                          notes: sellStock.notes || '',
                          marketSentiment: 'neutral' as const,
                          decisionFactors: {
                            fundamental: false,
                            technical: false,
                            sentiment: false,
                            other: false,
                          },
                          outcome,
                          actualReturn,
                          lessons: '',
                        };
                        console.log('add sell trade', { outcome, actualReturn, tradeObj });
                        const outcomeText = outcome === 'profit' ? '獲利 Profit' : outcome === 'loss' ? '虧損 Loss' : '打平 Breakeven';
                        toast.success(`賣出成功，結果：${outcomeText} | Sell success, outcome: ${outcomeText}`);
                        handleAddTrade(tradeObj);
                        setShowSellModal(false);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold mb-1">Quantity</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={sellForm.quantity}
                          min={1} max={sellStock.quantity}
                          onChange={e => setSellForm(f => ({ ...f, quantity: Number(e.target.value) }))} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Sell Price</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={sellForm.price}
                          onChange={e => setSellForm(f => ({ ...f, price: Number(e.target.value) }))} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Date</label>
                        <input type="date" className="w-full border rounded px-3 py-2" value={sellForm.date}
                          onChange={e => setSellForm(f => ({ ...f, date: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Reason</label>
                        <input type="text" className="w-full border rounded px-3 py-2" value={sellForm.reason}
                          onChange={e => setSellForm(f => ({ ...f, reason: e.target.value }))} />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700">Confirm Sell</button>
                        <button type="button" className="flex-1 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowSellModal(false)}>Cancel</button>
                      </div>
                    </form>
                  </Modal>
                )}
              </>
            )}
            {tab === 'analysis' && (
              <>
                <OverviewCards
                  summary={summary}
                  fearGreedValue={sheetIndicators.cnn ? Number(sheetIndicators.cnn) : 0}
                  breadthValue={sheetIndicators.breadth ? Number(sheetIndicators.breadth) : 0}
                  nymoValue={sheetIndicators.nymo ? Number(sheetIndicators.nymo) : 0}
                  customValue={sheetIndicators.custom ? Number(sheetIndicators.custom) : 0}
                  user={user}
                  spyYTD={spyYTD}
                  spyYTDStart={spyYTDStart}
                  spyYTDEnd={spyYTDEnd}
                  holdings={holdings}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <PortfolioPieChart holdings={holdings} />
                  <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Holdings</span>
                        <span className="font-semibold">{holdings.filter(h => h.symbol !== 'CASH').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cash Balance</span>
                        <span className="font-semibold">${holdings.find(h => h.symbol === 'CASH')?.purchasePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Portfolio Value</span>
                        <span className="font-semibold">${summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Gain/Loss</span>
                        <span className={`font-semibold ${summary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {summary.totalGain >= 0 ? '+' : ''}${summary.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <PortfolioPerformanceTable holdings={holdings} />
              </>
            )}
            {tab === 'performance' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold font-heading mb-2">Performance Tracking</h2>
                  <p className="text-gray-600">Track your portfolio performance over time and compare with market benchmarks</p>
                </div>
                <PortfolioHistoryChart holdings={holdings} />
              </>
            )}
            {tab === 'insider' && (
              <TradeLog holdings={holdings} trades={trades} onAddTrade={handleAddTrade} />
            )}
            {tab === 'links' && (
              <div>
                {/* Einstein Quote */}
                <div className="text-xl font-semibold text-center mb-6">
                  <span className="font-handwriting block">“Compound interest is the eighth wonder of the world.”</span><br />
                  <span className="text-gray-500 text-base">— Albert Einstein</span>
                </div>
                {/* Tool Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Morningstar',
                      url: 'https://www.morningstar.com',
                      bestFor: 'Long-term investors, beginners',
                      features: 'Stock ratings, fundamental analysis, portfolio tools',
                      highlights: 'Authoritative research, reliable data',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.morningstar.com',
                    },
                    {
                      name: 'Simply Wall St',
                      url: 'https://simplywall.st',
                      bestFor: 'Visual learners',
                      features: 'Bubble charts, snowflake visualizations',
                      highlights: 'Turns complex data into intuitive graphics',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://simplywall.st',
                    },
                    {
                      name: 'Zacks Investment Research',
                      url: 'https://www.zacks.com',
                      bestFor: 'Investors who value analyst opinions',
                      features: 'Stock ratings, earnings forecasts, research reports',
                      highlights: 'Famous earnings revision model',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.zacks.com',
                    },
                    {
                      name: 'Yahoo Finance',
                      url: 'https://finance.yahoo.com',
                      bestFor: 'All investors',
                      features: 'Free financial data, news, charts',
                      highlights: 'Comprehensive, free, clean interface',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://finance.yahoo.com',
                    },
                    {
                      name: 'Seeking Alpha',
                      url: 'https://seekingalpha.com',
                      bestFor: 'Investors who like reading analysis articles',
                      features: 'Investment articles, user analysis, stock discussions',
                      highlights: 'Community-driven investment platform',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://seekingalpha.com',
                    },
                    {
                      name: 'TradingView',
                      url: 'https://www.tradingview.com',
                      bestFor: 'Technical analysis enthusiasts',
                      features: 'Professional charting tools, indicators, community',
                      highlights: 'Best-in-class charting, strong free version',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.tradingview.com',
                    },
                    {
                      name: 'Finviz',
                      url: 'https://finviz.com',
                      bestFor: 'Investors who need fast stock screening',
                      features: 'Stock screener, market heatmaps, technical analysis',
                      highlights: 'Screener, Maps, and visual market performance',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://finviz.com',
                    },
                    {
                      name: 'Portfolio Visualizer',
                      url: 'https://www.portfoliovisualizer.com',
                      bestFor: 'Quantitative investors, backtesters',
                      features: 'Portfolio backtesting, asset allocation analysis',
                      highlights: 'Powerful historical backtesting, free',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.portfoliovisualizer.com',
                    },
                    {
                      name: 'Robinhood',
                      url: 'https://robinhood.com',
                      bestFor: 'Beginner investors',
                      features: 'Stock trading, zero commission',
                      highlights: 'Simple, clear charts, easy to use',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://robinhood.com',
                    },
                    {
                      name: 'Webull',
                      url: 'https://www.webull.com',
                      bestFor: 'Investors who want to practice',
                      features: 'Stock trading, paper trading',
                      highlights: 'Demo accounts for strategy practice',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.webull.com',
                    },
                    {
                      name: 'Copilot.money',
                      url: 'https://copilot.money/download/',
                      bestFor: 'Investors needing professional portfolio management',
                      features: 'Portfolio tracking, performance analysis, asset allocation',
                      highlights: 'Auto-sync bank accounts, pro-level analytics',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://copilot.money',
                    },
                    {
                      name: 'FRED',
                      url: 'https://fred.stlouisfed.org',
                      bestFor: 'Macro-focused investors',
                      features: 'Federal Reserve economic data, charting tools',
                      highlights: 'Authoritative, free economic data',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://fred.stlouisfed.org',
                    },
                    {
                      name: 'CNN Fear & Greed Index',
                      url: 'https://www.cnn.com/markets/fear-and-greed',
                      bestFor: 'Sentiment-focused investors',
                      features: 'Fear & Greed index, market sentiment analysis',
                      highlights: 'Composite sentiment index from 7 indicators',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.cnn.com',
                    },
                    {
                      name: 'VIX Central',
                      url: 'https://vixcentral.com',
                      bestFor: 'Volatility traders',
                      features: 'VIX data, term structure analysis',
                      highlights: 'Professional volatility data platform',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://vixcentral.com',
                    },
                    {
                      name: 'StreakyAlgo TSLA Multi-Timeframe Technical Scores',
                      url: 'https://wztctech.com/index/chart/score/stock?code=TSLA#google_vignette',
                      bestFor: 'Technical traders, TSLA enthusiasts',
                      features: 'Multi-timeframe technical analysis for TSLA (30m, 2h, daily, weekly, monthly)',
                      highlights: 'Quickly assess TSLA trends across different timeframes',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://wztctech.com',
                    },
                    {
                      name: 'SqueezeMetrics DIX/GEX Monitor',
                      url: 'https://www.squeezemetrics.com/monitor/dix?',
                      bestFor: 'Sentiment and options flow analysts',
                      features: 'Real-time DIX (Dark Index) and GEX (Gamma Exposure) for US equities',
                      highlights: 'Unique insights into institutional activity and market positioning',
                      iconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.squeezemetrics.com',
                    },
                  ].sort((a, b) => a.name.localeCompare(b.name))
                   .map(tool => (
                      <ToolCard key={tool.name} {...tool} />
                  ))}
                </div>
                {/* Tips */}
                <div className="mt-8 text-sm text-gray-600">
                  <div className="font-semibold mb-2">Tips:</div>
                  <ul className="list-disc pl-5">
                    <li>Prefer free tools: Most features are sufficient in the free version.</li>
                    <li>Combine tools: Each tool has its own strengths—use them together.</li>
                    <li>Cross-check data: For important decisions, compare multiple sources.</li>
                    <li>Stay updated: Tools evolve, check for new features regularly.</li>
                  </ul>
                </div>
                {/* Further Reading */}
                <div className="mt-10">
                  <div className="font-semibold mb-2 text-base">Further Reading:</div>
                  <ul className="list-disc pl-5 text-sm">
                    <li>
                      <a
                        href="https://www.wrightresearch.in/blog/how-greed-and-fear-drive-stock-market-investors/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        How Greed and Fear Drive Stock Market Investors (Wright Research)
                      </a>
                      <span className="text-gray-500 ml-2">— A clear explanation of the CNN Fear & Greed Index and its key indicators.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {tab === 'feedback' && (
              <FeedbackForm />
            )}
            {targetReachedQueue.length > 0 && (
              <Modal isOpen={true} onClose={() => setTargetReachedQueue(q => q.slice(1))} title=" 🚀 Target Reached 🚀">
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold">{targetReachedQueue[0].name} ({targetReachedQueue[0].symbol})</div>
                  <div className="text-gray-700">Current Price: <span className="font-bold text-blue-600">${targetReachedQueue[0].currentPrice}</span></div>
                  <div className="text-gray-700">Target Price: <span className="font-bold text-green-600">${targetReachedQueue[0].targetPrice}</span></div>
                  <button
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setTargetReachedQueue(q => q.slice(1))}
                  >
                    Got it
                  </button>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-red-500 mt-6 font-wenkai text-center">
        本網站所有內容僅供學術與交流參考，非投資建議，投資盈虧請自負。<br/>
        <span className="text-gray-500 font-inter">
          All content on this site is for academic and communication purposes only. This is not investment advice. Invest at your own risk.
        </span>
      </p>
    </Layout>
  );
}

function FeedbackForm() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      if (res.ok) {
        setStatus('success');
        setEmail(''); setSubject(''); setMessage('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send feedback');
        setStatus('error');
      }
    } catch (e) {
      setError('Failed to send feedback');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold font-heading mb-2">Send Feedback</h2>
        <p className="text-gray-600">We'd love to hear your thoughts about Plan B Portfolio Manager</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Email <span className="text-gray-400">(optional)</span>
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              placeholder="you@email.com" 
            />
            <p className="text-sm text-gray-500 mt-1">We'll only use this to respond to your feedback</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              placeholder="e.g., Bug report, Feature request, General feedback" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none" 
              rows={6} 
              placeholder="Tell us what you think about Plan B Portfolio Manager. What works well? What could be improved? Any bugs you've encountered?" 
              required 
            />
            <p className="text-sm text-gray-500 mt-1">Be as detailed as possible to help us improve</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </div>
              ) : (
                'Send Feedback'
              )}
            </button>
          </div>

          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-800 font-medium">Thank you for your feedback!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">We've received your message and will get back to you soon.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-800 font-medium">Failed to send feedback</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold font-heading mb-3">What kind of feedback are we looking for?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🐞 Bug Reports</h4>
              <p className="text-sm text-blue-700">Found something that's not working? Let us know with details about what happened.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">💡 Feature Requests</h4>
              <p className="text-sm text-green-700">Have ideas for new features? We'd love to hear what would make Plan B better.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">😉 General Feedback</h4>
              <p className="text-sm text-purple-700">Thoughts on the interface, performance, or overall user experience.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">📈 Investment Tools</h4>
              <p className="text-sm text-yellow-700">Suggestions for new analysis tools, charts, or portfolio management features.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}