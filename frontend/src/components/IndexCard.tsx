import React from 'react';

export default function IndexCard({
  title,
  value,
  img,
  source,
  link,
  description,
  hideSource = false,
  valueColor,
  level,
  advice,
}: {
  title: string;
  value?: string | number;
  img?: string;
  source?: React.ReactNode;
  link?: string;
  description?: string;
  hideSource?: boolean;
  valueColor?: string;
  level?: string;
  advice?: string;
}) {
  // 動態決定主內容區塊高度
  const mainContentMinHeight = (typeof value !== 'undefined' && !img && level) ? 0 : 32;
  const imgSize = 70;

  // 顏色判斷邏輯移到這裡
  const getValueClass = () => {
    if (title === 'Fear & Greed') {
      if (Number(value) >= 75) return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text';
      if (Number(value) <= 25) return 'bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400 text-transparent bg-clip-text';
      return 'text-black';
    }
    if (title === 'Market Breadth') {
      if (Number(value) >= 750) return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text';
      if (Number(value) <= 200) return 'bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400 text-transparent bg-clip-text';
      return 'text-black';
    }
    if (title === 'NYMO') {
      if (Number(value) >= 60) return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text';
      if (Number(value) <= -60) return 'bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400 text-transparent bg-clip-text';
      return 'text-black';
    }
    if (title === 'Plan B index') {
      if (Number(value) < 15) return 'bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400 text-transparent bg-clip-text';
      if (Number(value) < 50) return 'text-black';
      if (Number(value) < 70) return 'bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 text-transparent bg-clip-text';
      return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text';
    }
    return 'text-black';
  };

  const content = (
    <div className="flex flex-col items-center bg-white rounded-xl px-2 py-1 shadow-md hover:shadow-lg transition mx-1 min-w-[120px] max-w-[140px] min-h-[110px]" style={{ boxSizing: 'border-box' }}>
      <div className="text-xs font-inter font-semibold text-gray-500 mb-1 text-center w-full">{title}</div>
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {value !== undefined && value !== null ? (
          <div
            className={`text-4xl font-extrabold mb-1 font-mono tracking-tight ${getValueClass()}`}
          >
            {title === 'NYMO' && typeof value === 'number' ? Math.round(value) : value}
          </div>
        ) : null}
        {source && (
          <div className="text-[9px] font-inter text-gray-400 mt-2 text-center w-full truncate whitespace-nowrap max-w-[90%]">
            {title === 'Plan B index' ? source : <>Source: {source}</>}
          </div>
        )}
      </div>
      {level && (
        <div className={`text-[8px] font-semibold mt-1 ${valueColor ? valueColor : ''}`}>{level}</div>
      )}
      {advice && (
        <div className="text-[6px] text-gray-400 text-center">{advice}</div>
      )}
    </div>
  );
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" title={title}>
      {content}
    </a>
  ) : (
    content
  );
}