import { Outlet } from 'react-router';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Enterprise Banking</h1>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
