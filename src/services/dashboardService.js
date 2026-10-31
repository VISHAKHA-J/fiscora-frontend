import api from './api.js';

// month is "YYYY-MM"
export const getDashboardSummary = (month) =>
  api.get('/api/dashboard/summary', { params: { month } }).then((res) => res.data);

// [{ month: "2026-10", income, expense }, ...] oldest first, ending with the current month
export const getTrend = (months = 6) =>
  api.get('/api/dashboard/trend', { params: { months } }).then((res) => res.data);