import React from 'react';

export default function FearGreedCard({ value }: { value: string | number }) {
  return (
    <a
      href="https://www.cnn.com/markets/fear-and-greed"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer group"
      title="View details on CNN"
    >
      <div className="text-gray-500 text-sm mb-1">Fear & Greed Index</div>
      <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline transition">
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-2">Source: CNN</div>
    </a>
  );
} 