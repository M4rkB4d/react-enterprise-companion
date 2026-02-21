import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas';
import { useLogin } from '../hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/form/FormField';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {loginMutation.isError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">
            {loginMutation.error?.response?.status === 401
              ? 'Invalid email or password.'
              : loginMutation.error?.response?.status === 423
                ? 'Account is locked. Please contact support.'
                : 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      )}

      <FormField label="Email Address" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          placeholder="Enter your password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </FormField>

      <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Demo credentials: demo@bank.com / password123
      </p>
    </form>
  );
}
