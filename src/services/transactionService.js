import api from './api.js';

// filters: { accountId, categoryId, from, to } - empty values are skipped
export const getTransactions = (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  return api.get('/api/transactions', { params }).then((res) => res.data);
};

// { accountId, categoryId, amount, date, note }
export const createTransaction = (payload) =>
  api.post('/api/transactions', payload).then((res) => res.data);

// same body as create: PUT replaces the whole transaction
export const updateTransaction = (id, payload) =>
  api.put(`/api/transactions/${id}`, payload).then((res) => res.data);

export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);