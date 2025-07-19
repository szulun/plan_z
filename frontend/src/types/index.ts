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
}

export interface InvestmentInsight {
  id: string;
  type: 'patience' | 'confidence' | 'maturity' | 'learning';
  title: string;
  description: string;
  value: number;
  date: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  stocks: Stock[];
  createdAt: Date;
  updatedAt: Date;
} 