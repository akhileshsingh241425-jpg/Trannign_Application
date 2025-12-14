import axios from 'axios';

const API_BASE = '/api';

export const employeeAPI = {
  sync: () => axios.post(`${API_BASE}/employees/sync`),
  getAll: (params) => axios.get(`${API_BASE}/employees`, { params }),
  getById: (id) => axios.get(`${API_BASE}/employees/${id}`),
  getStats: () => axios.get(`${API_BASE}/employees/stats`)
};

export const trainingAPI = {
  getAll: (params) => axios.get(`${API_BASE}/trainings`, { params }),
  getCalendar: (params) => axios.get(`${API_BASE}/trainings/calendar`, { params }),
  getStats: () => axios.get(`${API_BASE}/trainings/stats`),
  create: (data) => axios.post(`${API_BASE}/trainings`, data),
  update: (id, data) => axios.put(`${API_BASE}/trainings/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/trainings/${id}`)
};

export const testAPI = {
  getAll: (params) => axios.get(`${API_BASE}/tests`, { params }),
  getStats: () => axios.get(`${API_BASE}/tests/stats`),
  create: (data) => axios.post(`${API_BASE}/tests`, data),
  update: (id, data) => axios.put(`${API_BASE}/tests/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/tests/${id}`)
};

export const competencyAPI = {
  getMatrix: (params) => axios.get(`${API_BASE}/competency`, { params }),
  getStats: (params) => axios.get(`${API_BASE}/competency/stats`, { params }),
  upsert: (data) => axios.post(`${API_BASE}/competency`, data)
};
