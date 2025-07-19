'use client';

import { motion } from 'framer-motion';
import { InvestmentInsight } from '@/types';
import { TrendingUp, Brain, Heart, Target } from 'lucide-react';

interface InvestmentInsightsProps {
  insights: InvestmentInsight[];
}

export default function InvestmentInsights({ insights }: InvestmentInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'patience':
        return <Heart className="w-5 h-5 text-pink-600" />;
      case 'confidence':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'maturity':
        return <Brain className="w-5 h-5 text-blue-600" />;
      case 'learning':
        return <Target className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'patience':
        return 'Patience Score';
      case 'confidence':
        return 'Confidence Index';
      case 'maturity':
        return 'Investment Maturity';
      case 'learning':
        return 'Learning Progress';
      default:
        return 'Insight';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Investment Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3 mb-3">
              {getInsightIcon(insight.type)}
              <div>
                <h4 className="font-medium text-gray-900">{getInsightTitle(insight.type)}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{insight.value}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${insight.value}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 