/**
 * Core performance metrics based on Web Vitals
 */
export interface WebVitalsMetrics {
  // Largest Contentful Paint - loading performance
  lcp: number;
  // First Input Delay - interactivity
  fid: number;
  // Cumulative Layout Shift - visual stability
  cls: number;
  // First Contentful Paint
  fcp: number;
  // Time to First Byte
  ttfb: number;
  // Interaction to Next Paint
  inp: number;
}

export interface PerformanceBudget {
  // Bundle size limits (KB)
  maxBundleSize: number;
  maxChunkSize: number;
  maxInitialLoad: number;

  // Timing limits (ms)
  maxLCP: number;
  maxFID: number;
  maxTTFB: number;

  // Other limits
  maxCLS: number;
  maxRequestsPerPage: number;
}

export interface PerformanceConfig {
  budget: PerformanceBudget;
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    endpoint: string;
  };
  optimization: {
    enableCodeSplitting: boolean;
    enablePrefetch: boolean;
    enableServiceWorker: boolean;
    enableImageOptimization: boolean;
  };
}

// Default performance budget for enterprise applications
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 250, // 250KB gzipped
  maxChunkSize: 50, // 50KB per chunk
  maxInitialLoad: 150, // 150KB initial JS

  maxLCP: 2500, // 2.5 seconds
  maxFID: 100, // 100ms
  maxTTFB: 800, // 800ms

  maxCLS: 0.1,
  maxRequestsPerPage: 50,
};

export const performanceConfig: PerformanceConfig = {
  budget: DEFAULT_PERFORMANCE_BUDGET,
  monitoring: {
    enabled: true,
    sampleRate: 0.1, // 10% of users
    endpoint: '/api/performance/metrics',
  },
  optimization: {
    enableCodeSplitting: true,
    enablePrefetch: true,
    enableServiceWorker: true,
    enableImageOptimization: true,
  },
};
