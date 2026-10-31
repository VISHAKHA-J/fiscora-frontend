import api from './api.js';

// month is "YYYY-MM"; leave it out for the current month
export const getBudgets = (month) =>
  api.get('/api/budgets', { params: month ? { month } : {} }).then((res) => res.data);

// { categoryId, amount }
export const createBudget = (payload) => api.post('/api/budgets', payload).then((res) => res.data);

// { amount } - the category cannot be changed
export const updateBudget = (id, payload) =>
  api.put(`/api/budgets/${id}`, payload).then((res) => res.data);

export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);