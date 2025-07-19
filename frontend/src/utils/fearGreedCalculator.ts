// VIX 基礎恐懼貪婪指數計算器
interface MarketData {
  currentVix: number;
  vixMA20: number;
  spyChange: number;
  vixChange: number;
  volume?: number;
}

class FearGreedCalculator {
  vixRanges: Record<string, { min: number; max: number }>;
  movingAverageWeights: { vix: number; momentum: number; breadth: number };

  constructor() {
    this.vixRanges = {
      extremeFear: { min: 0, max: 12 },
      fear: { min: 12, max: 20 },
      neutral: { min: 20, max: 30 },
      greed: { min: 30, max: 40 },
      extremeGreed: { min: 40, max: 100 }
    };
    this.movingAverageWeights = {
      vix: 0.4,
      momentum: 0.3,
      breadth: 0.3
    };
  }
  calculateFearGreedIndex(marketData: MarketData) {
    const { currentVix, vixMA20, spyChange, vixChange, volume } = marketData;
    const vixScore = this.calculateVixScore(currentVix);
    const vixMomentumScore = this.calculateVixMomentumScore(currentVix, vixMA20);
    const momentumScore = this.calculateMomentumScore(spyChange, vixChange);
    const fearGreedIndex = Math.round(
      (vixScore * this.movingAverageWeights.vix) +
      (vixMomentumScore * this.movingAverageWeights.momentum) +
      (momentumScore * this.movingAverageWeights.breadth)
    );
    return {
      index: Math.max(0, Math.min(100, fearGreedIndex)),
      components: {
        vixScore: Math.round(vixScore),
        vixMomentumScore: Math.round(vixMomentumScore),
        momentumScore: Math.round(momentumScore)
      },
      interpretation: this.getInterpretation(fearGreedIndex)
    };
  }
  calculateVixScore(vix: number) {
    if (vix <= 12) return 100;
    if (vix <= 16) return 80;
    if (vix <= 20) return 60;
    if (vix <= 25) return 40;
    if (vix <= 30) return 20;
    return 10;
  }
  calculateVixMomentumScore(currentVix: number, vixMA20: number) {
    if (!vixMA20) return 50;
    const vixRatio = currentVix / vixMA20;
    if (vixRatio < 0.8) return 80;
    if (vixRatio < 0.9) return 65;
    if (vixRatio < 1.1) return 50;
    if (vixRatio < 1.2) return 35;
    return 20;
  }
  calculateMomentumScore(spyChange: number, vixChange: number) {
    let score = 50;
    if (spyChange > 2) score += 20;
    else if (spyChange > 1) score += 10;
    else if (spyChange > 0) score += 5;
    else if (spyChange > -1) score -= 5;
    else if (spyChange > -2) score -= 10;
    else score -= 20;
    if (vixChange < -15) score += 15;
    else if (vixChange < -10) score += 10;
    else if (vixChange < -5) score += 5;
    else if (vixChange > 15) score -= 15;
    else if (vixChange > 10) score -= 10;
    else if (vixChange > 5) score -= 5;
    return score;
  }
  getInterpretation(index: number) {
    if (index >= 75) return { 
      level: "Extreme Greed", 
      color: "#dc2626",
      advice: "The market may be overheated. Consider reducing risk exposure." 
    };
    if (index >= 55) return { 
      level: "Greed", 
      color: "#ea580c",
      advice: "Be cautious. Consider taking some profits." 
    };
    if (index >= 45) return { 
      level: "Neutral", 
      color: "#65a30d",
      advice: "Market sentiment is stable. Stay observant." 
    };
    if (index >= 25) return { 
      level: "Fear", 
      color: "#0891b2",
      advice: "Potential buying opportunity during market dips." 
    };
    return { 
      level: "Extreme Fear", 
      color: "#7c3aed",
      advice: "Historically, this is often a great buying opportunity." 
    };
  }
  calculateSimplifiedNYMO(marketData: Record<string, number>) {
    const { spyChange, iwmChange, qqqChange, diaChange, vtiChange } = marketData;
    const changes = [spyChange, iwmChange, qqqChange, diaChange, vtiChange].filter(change => change !== undefined);
    if (changes.length === 0) return 0;
    const positiveCount = changes.filter(change => change > 0).length;
    const negativeCount = changes.filter(change => change < 0).length;
    const breadthRatio = (positiveCount - negativeCount) / changes.length;
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const nymoScore = (breadthRatio * 50) + (avgChange * 10);
    return Math.max(-100, Math.min(100, nymoScore));
  }
}

export { FearGreedCalculator }; 