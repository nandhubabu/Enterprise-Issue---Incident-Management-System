import { apiRequest } from './client';

export const userApi = {
  getAllUsers: () => apiRequest('/users'),

  getDevelopers: () => apiRequest('/users/developers'),

  getUserById: (id) => apiRequest(`/users/${id}`),

  updateUser: (id, userData) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};
