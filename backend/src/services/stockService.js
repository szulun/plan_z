const axios = require('axios');

class StockService {
  // Get real-time stock quote using Alpha Vantage
  async getQuote(symbol) {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
      });

      const quote = response.data['Global Quote'];
      if (!quote) {
        throw new Error('Stock not found');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
    }
  }

  // Get company overview using Alpha Vantage
  async getCompanyOverview(symbol) {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
      });

      const overview = response.data;
      return {
        symbol: overview.Symbol,
        name: overview.Name,
        description: overview.Description,
        sector: overview.Sector,
        industry: overview.Industry,
        marketCap: overview.MarketCapitalization,
        pe: overview.PERatio,
        dividend: overview.DividendYield,
        beta: overview.Beta,
        eps: overview.EPS,
        bookValue: overview.BookValue
      };
    } catch (error) {
      throw new Error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
    }
  }

  // Search for stocks using Finnhub
  async searchStocks(query) {
    try {
      const response = await axios.get('https://finnhub.io/api/v1/search', {
        params: {
          q: query,
          token: process.env.FINNHUB_API_KEY
        }
      });

      return response.data.result.map(item => ({
        symbol: item.symbol,
        name: item.description,
        type: item.type,
        primaryExchange: item.primaryExchange
      }));
    } catch (error) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  }
}

module.exports = new StockService(); 