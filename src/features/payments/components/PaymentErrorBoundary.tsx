import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[PaymentErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We encountered an error in the payments section.
          </p>
          {this.state.error && (
            <pre className="mt-3 max-w-md overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
