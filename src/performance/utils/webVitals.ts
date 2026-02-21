import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import type { WebVitalsMetrics } from '../types/performance.types';

type MetricHandler = (metric: Metric) => void;

interface PerformanceReporter {
  report: (metrics: Partial<WebVitalsMetrics>) => void;
  flush: () => Promise<void>;
}

class WebVitalsCollector {
  private metrics: Partial<WebVitalsMetrics> = {};
  private reporters: PerformanceReporter[] = [];
  private isInitialized = false;

  init(): void {
    if (this.isInitialized) return;

    const handleMetric: MetricHandler = (metric) => {
      const name = metric.name.toLowerCase() as keyof WebVitalsMetrics;
      this.metrics[name] = metric.value;

      // Report individual metric
      this.reporters.forEach((reporter) => {
        reporter.report({ [name]: metric.value });
      });
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    this.isInitialized = true;
  }

  addReporter(reporter: PerformanceReporter): void {
    this.reporters.push(reporter);
  }

  getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  async flush(): Promise<void> {
    await Promise.all(this.reporters.map((r) => r.flush()));
  }
}

export const webVitals = new WebVitalsCollector();

// Analytics reporter
export function createAnalyticsReporter(endpoint: string): PerformanceReporter {
  const queue: Partial<WebVitalsMetrics>[] = [];

  return {
    report(metrics) {
      queue.push(metrics);
    },
    async flush() {
      if (queue.length === 0) return;

      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: queue,
            url: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        });
        queue.length = 0;
      } catch (error) {
        console.error('Failed to report metrics:', error);
      }
    },
  };
}
