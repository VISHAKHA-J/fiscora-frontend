import api from './api.js';

// month is "YYYY-MM"
export const getDashboardSummary = (month) =>
  api.get('/api/dashboard/summary', { params: { month } }).then((res) => res.data);