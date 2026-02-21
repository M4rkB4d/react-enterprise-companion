import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from './LoginForm';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Enterprise Banking</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage your accounts</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
