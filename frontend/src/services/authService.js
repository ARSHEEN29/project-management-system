import api from './api.js';

export const login = async (email, password) => {
  try {
    console.log("Sending login request...");

    const response = await api.post('/auth/login', {
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", response);

    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    alert("LOGIN ERROR: " + error.message);

    throw error;
  }
};

export const register = async (fullName, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
    });

    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    alert("REGISTER ERROR: " + error.message);

    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error on backend:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};