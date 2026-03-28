import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

export const getCompanies = () => api.get('/companies');
export const getStockData = (symbol, days = 30) => api.get(`/data/${symbol}?days=${days}`);
export const getStockSummary = (symbol) => api.get(`/summary/${symbol}`);
export const compareStocks = (symbol1, symbol2) => api.get(`/compare?symbol1=${symbol1}&symbol2=${symbol2}`);
