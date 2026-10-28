import api from './api.js';

export const getAccounts = () => api.get('/api/accounts').then((res) => res.data);

// { name, type, openingBalance }
export const createAccount = (payload) => api.post('/api/accounts', payload).then((res) => res.data);

// { name, type } - balance is never edited here
export const updateAccount = (id, payload) =>
  api.put(`/api/accounts/${id}`, payload).then((res) => res.data);

export const deleteAccount = (id) => api.delete(`/api/accounts/${id}`);