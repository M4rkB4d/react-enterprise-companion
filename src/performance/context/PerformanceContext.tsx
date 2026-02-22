import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import { webVitals, createAnalyticsReporter } from '../utils/webVitals';
import type { WebVitalsMetrics, PerformanceConfig } from '../types/performance.types';
import { performanceConfig } from '../types/performance.types';

interface PerformanceContextValue {
  metrics: Partial<WebVitalsMetrics>;
  config: PerformanceConfig;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  reportCustomMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  config?: Partial<PerformanceConfig>;
}

export function PerformanceProvider({ children, config }: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<Partial<WebVitalsMetrics>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const hasInitRef = useRef(false);

  const mergedConfig = useMemo<PerformanceConfig>(
    () => ({
      ...performanceConfig,
      ...config,
      budget: { ...performanceConfig.budget, ...config?.budget },
      monitoring: { ...performanceConfig.monitoring, ...config?.monitoring },
      optimization: { ...performanceConfig.optimization, ...config?.optimization },
    }),
    [config],
  );

  const startMonitoring = useCallback(() => {
    if (mergedConfig.monitoring.enabled && !hasInitRef.current) {
      hasInitRef.current = true;
      webVitals.init();
      webVitals.addReporter(createAnalyticsReporter(mergedConfig.monitoring.endpoint));
      setIsMonitoring(true);
    }
  }, [mergedConfig.monitoring.enabled, mergedConfig.monitoring.endpoint]);

  const stopMonitoring = useCallback(() => {
    webVitals.flush();
    setIsMonitoring(false);
  }, []);

  const reportCustomMetric = useCallback(
    (name: string, value: number) => {
      if (isMonitoring) {
        fetch(mergedConfig.monitoring.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customMetrics: { [name]: value },
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }
    },
    [isMonitoring, mergedConfig.monitoring.endpoint],
  );

  useEffect(() => {
    if (Math.random() < mergedConfig.monitoring.sampleRate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: one-time initialization on mount
      startMonitoring();
    }

    const interval = setInterval(() => {
      setMetrics(webVitals.getMetrics());
    }, 5000);

    const handleUnload = () => {
      webVitals.flush();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring, mergedConfig.monitoring.sampleRate]);

  return (
    <PerformanceContext.Provider
      value={{
        metrics,
        config: mergedConfig,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        reportCustomMetric,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePerformance(): PerformanceContextValue {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
