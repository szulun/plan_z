'use client';

import { useRouter } from 'next/navigation';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '700'],
  display: 'swap',
});

function getNumberColor(value: number) {
  if (value > 70) return "text-red-500";
  if (value >= 40) return "text-yellow-500";
  return "text-green-500";
}

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-xl w-full p-8 bg-white/90 rounded-2xl shadow-xl flex flex-col items-center">
        <div className="flex items-end mb-4 relative" style={{ height: '120px' }}>
          <span
            className="w-10 h-10 rounded-full bg-gray-400 inline-block absolute z-0"
            style={{
              left: '-50px',   
              top: '40px',     
            }}
          ></span>
          <span
            className="relative z-10 -ml-10 text-7xl"
            style={{
              fontFamily: 'var(--font-sacramento), cursive',
              letterSpacing: '2px',
              color: '#222',
              lineHeight: 1,
            }}
          >
            Plan B
          </span>
        </div>
        <p
          className="text-xl text-gray-600 mb-8 text-center font-light leading-relaxed tracking-wide"
          style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
        >
          A clean, modern investment dashboard. Track your portfolio, analyze performance, and discover market insights — all in one place.
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <a href="https://www.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center bg-white rounded-lg px-4 py-3 shadow border border-gray-200 min-w-[120px]">
            <div className="text-xs text-gray-500">Fear & Greed</div>
            <img src="/fear-greed.png" alt="Fear & Greed" style={{ width: 60, height: 'auto', margin: '0 auto' }} />
            <div className="text-[10px] text-gray-400">CNN</div>
          </a>
          <a href="https://www.tradinglogic.com/market-breadth" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center bg-white rounded-lg px-4 py-3 shadow border border-gray-200 min-w-[120px]">
            <div className="text-xs text-gray-500">Market Breadth</div>
            <img src="/current_breadth.png" alt="Market Breadth" style={{ width: 60, height: 'auto', margin: '0 auto' }} />
            <div className="text-[10px] text-gray-400">Trading Logic</div>
          </a>
          <a href="https://stockcharts.com/h-sc/ui?s=$NYMO" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center bg-white rounded-lg px-4 py-3 shadow border border-gray-200 min-w-[120px]">
            <div className="text-xs text-gray-500">NYMO</div>
            <img src="/nymo.png" alt="NYMO" style={{ width: 60, height: 'auto', margin: '0 auto' }} />
            <div className="text-[10px] text-gray-400">StockCharts</div>
          </a>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-lg border border-gray-900 text-gray-900 font-semibold hover:bg-gray-100 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}