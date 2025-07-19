export interface User {
  id: string;
  email: string;
  name: string;
  investmentStyle: 'conservative' | 'moderate' | 'aggressive';
  createdAt: Date;
  lastLogin: Date;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  targetPrice?: number;
  notes?: string;
  buyReason?: string;
  sector?: string;
  currentPrice?: number;
  lastUpdated?: Date;
  performance?: {
    totalGain: number;
    gainPercentage: number;
    isTargetReached: boolean;
  };
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  stocks: Stock[];
  isActive: boolean;
  metrics: {
    totalValue: number;
    totalCost: number;
    totalGain: number;
    gainPercentage: number;
    lastCalculated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentInsight {
  id: string;
  userId: string;
  type: 'patience' | 'confidence' | 'maturity' | 'learning';
  title: string;
  description: string;
  value: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 