import api from './api.js';
import axios from 'axios';

export const getAllTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response;
};

export const exportTasksCsv = async (params = {}) => {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:5000/api/tasks/export', {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob'
  });
  
  // Generate download attachment link
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tasks_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
