// src/api/interceptors.ts — Auth interceptors (Doc 08 §3)
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

/**
 * Attach JWT token from Zustand auth store to every outgoing request.
 * Falls back to localStorage for edge cases (e.g., non-React callers).
 */
export function setupAuthInterceptor(client: AxiosInstance): void {
  // --- Request interceptor: attach Bearer token ---
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().user ? localStorage.getItem('access_token') : null;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // --- Response interceptor: handle 401 Unauthorized ---
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
}
