import React from 'react';

interface ToolCardProps {
  name: string;
  url: string;
  bestFor: string;
  features: string;
  highlights: string;
  iconUrl?: string;
}

const getBestForColor = (bestFor: string) => {
  if (/long-term|beginner|all investors/i.test(bestFor)) return 'bg-green-100 text-green-700';
  if (/visual|technical|chart|screen|quant/i.test(bestFor)) return 'bg-blue-100 text-blue-700';
  if (/practice|demo|paper/i.test(bestFor)) return 'bg-yellow-100 text-yellow-700';
  if (/community|sentiment|macro|reading/i.test(bestFor)) return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-700';
};

const ToolCard: React.FC<ToolCardProps> = ({ name, url, bestFor, features, highlights, iconUrl }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-white rounded-xl shadow hover:shadow-lg transition p-5 border border-gray-200 hover:border-blue-400 cursor-pointer h-full font-sans"
    style={{ textDecoration: 'none', fontFamily: 'Poppins, Montserrat, Inter, Arial, sans-serif' }}
  >
    {iconUrl && (
      <img src={iconUrl} alt={name} className="w-10 h-10 mb-2 mx-auto" />
    )}
    <div className="text-lg font-bold text-gray-900 mb-1 text-center tracking-wide" style={{fontFamily: 'Montserrat, Poppins, Inter, Arial, sans-serif'}}>{name}</div>
    <div className={`text-xs font-semibold px-2 py-1 rounded mb-2 text-center inline-block ${getBestForColor(bestFor)}`} style={{fontFamily: 'Poppins, Inter, Arial, sans-serif'}}>
      Best for: {bestFor}
    </div>
    <div className="text-xs text-gray-600 mb-1 leading-snug" style={{fontFamily: 'Inter, Poppins, Arial, sans-serif'}}>
      <span className="font-semibold">Main features:</span> {features}
    </div>
    <div className="text-xs text-gray-500 mb-1 leading-snug" style={{fontFamily: 'Inter, Poppins, Arial, sans-serif'}}>
      <span className="font-semibold">Highlights:</span> {highlights}
    </div>
    <div className="text-blue-600 text-xs mt-2 text-center underline" style={{fontFamily: 'Poppins, Inter, Arial, sans-serif'}}>Visit Website</div>
  </a>
);

export default ToolCard; 