import { apiRequest } from './client';

export const incidentApi = {
  getIncidents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.severity) query.append('severity', params.severity);
    if (params.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sort) query.append('sort', params.sort);

    return apiRequest(`/incidents?${query.toString()}`);
  },

  getStats: () => apiRequest('/incidents/stats'),

  getIncidentById: (id) => apiRequest(`/incidents/${id}`),

  createIncident: (incidentData) =>
    apiRequest('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    }),

  updateIncident: (id, incidentData) =>
    apiRequest(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incidentData),
    }),

  assignIncident: (id, developerId) =>
    apiRequest(`/incidents/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ developerId }),
    }),

  updateStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteIncident: (id) =>
    apiRequest(`/incidents/${id}`, {
      method: 'DELETE',
    }),
};
