import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authService } from '../services';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { LoginInput } from '../schemas';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),

    onSuccess: ({ tokens, user }) => {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      setUser(user);
      addNotification({ type: 'success', message: `Welcome back, ${user.name}!` });
      navigate('/');
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const status = error.response?.status;
      if (status === 401) {
        addNotification({ type: 'error', message: 'Invalid email or password.' });
      } else if (status === 423) {
        addNotification({
          type: 'error',
          message: 'Account is locked. Please contact support.',
        });
      } else {
        addNotification({
          type: 'error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      logout();
      addNotification({ type: 'info', message: 'You have been logged out.' });
      navigate('/login');
    },

    onError: () => {
      // Force logout even on error
      logout();
      navigate('/login');
    },
  });
}
