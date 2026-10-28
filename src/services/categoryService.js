import api from './api.js';

export const getCategories = () => api.get('/api/categories').then((res) => res.data);

// { name, type }  type is INCOME or EXPENSE
export const createCategory = (payload) =>
  api.post('/api/categories', payload).then((res) => res.data);

// { name } - the type cannot be changed once a category exists
export const updateCategory = (id, payload) =>
  api.put(`/api/categories/${id}`, payload).then((res) => res.data);

export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);