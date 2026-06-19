import axios from 'axios';

const api = axios.create({
  baseURL: 'https://project-management-backend-sriq.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log('REQUEST URL:', config.baseURL + config.url);

    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('SUCCESS RESPONSE:', response);
    return response.data;
  },
  (error) => {
    console.error('FULL ERROR OBJECT:', error);

    let message = '';

    if (error.response) {
      message = `
STATUS: ${error.response.status}

DATA:
${JSON.stringify(error.response.data, null, 2)}
      `;
    } else if (error.request) {
      message = 'NO RESPONSE RECEIVED FROM SERVER';
    } else {
      message = error.message;
    }

    alert(message);

    const formattedError = new Error(message);
    formattedError.status = error.response?.status || 500;
    formattedError.errors = error.response?.data?.errors || null;

    return Promise.reject(formattedError);
  }
);

export default api;