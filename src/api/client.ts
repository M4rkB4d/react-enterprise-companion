import axios from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (skip for login endpoint to allow inline error display)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
