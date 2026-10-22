import { apiRequest } from './client';

export const commentApi = {
  getComments: (incidentId) => apiRequest(`/incidents/${incidentId}/comments`),

  addComment: (incidentId, content) =>
    apiRequest(`/incidents/${incidentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  updateComment: (id, content) =>
    apiRequest(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (id) =>
    apiRequest(`/comments/${id}`, {
      method: 'DELETE',
    }),
};
