// Utilitários para monitoramento de performance e analytics

export interface PerformanceMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  memoryUsage?: number;
  userInteractions: number;
  errors: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    componentRenderTime: 0,
    memoryUsage: 0,
    userInteractions: 0,
    errors: 0
  };

  private startTimes: Map<string, number> = new Map();

  // Iniciar medição de tempo
  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  // Finalizar medição de tempo
  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer "${label}" não foi iniciado`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);
    
    // Atualizar métricas específicas
    if (label === 'pageLoad') {
      this.metrics.pageLoadTime = duration;
    } else if (label.includes('component')) {
      this.metrics.componentRenderTime += duration;
    }

    return duration;
  }

  // Registrar interação do usuário
  recordInteraction(): void {
    this.metrics.userInteractions++;
  }

  // Registrar erro
  recordError(): void {
    this.metrics.errors++;
  }

  // Obter uso de memória (se disponível)
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // Obter métricas atuais
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Reset métricas
  reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      componentRenderTime: 0,
      memoryUsage: 0,
      userInteractions: 0,
      errors: 0
    };
    this.startTimes.clear();
  }

  // Relatório de performance
  generateReport(): string {
    const metrics = this.getMetrics();
    return `
Performance Report:
- Page Load Time: ${metrics.pageLoadTime.toFixed(2)}ms
- Component Render Time: ${metrics.componentRenderTime.toFixed(2)}ms
- Memory Usage: ${metrics.memoryUsage?.toFixed(2)}MB
- User Interactions: ${metrics.userInteractions}
- Errors: ${metrics.errors}
    `.trim();
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor();

// Hook para medir performance de componentes
export const usePerformanceTimer = (componentName: string) => {
  const startTimer = () => {
    performanceMonitor.startTimer(`component-${componentName}`);
  };

  const endTimer = () => {
    return performanceMonitor.endTimer(`component-${componentName}`);
  };

  return { startTimer, endTimer };
};

// Debounce function para otimizar calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function para limitar calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Lazy loading de imagens
export const lazyLoadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Otimização de bundle
export const preloadRoute = async (routeComponent: () => Promise<any>) => {
  try {
    await routeComponent();
  } catch (error) {
    console.warn('Falha ao precarregar rota:', error);
  }
};

// Análise de bundle size
export const logBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      const entry = entries[0];
      console.log(`Bundle Load Time: ${entry.loadEventEnd - entry.fetchStart}ms`);
    }
  }
};

// Detecção de slow device
export const isSlowDevice = (): boolean => {
  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    return navigator.hardwareConcurrency <= 2;
  }
  return false;
};

// Detecção de conexão lenta
export const isSlowConnection = (): boolean => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

// Analytics simplificado
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class SimpleAnalytics {
  private events: AnalyticsEvent[] = [];

  track(event: AnalyticsEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now()
    } as any);

    // Log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  // Eventos pré-definidos
  trackPageView(page: string): void {
    this.track({
      action: 'page_view',
      category: 'navigation',
      label: page
    });
  }

  trackUserAction(action: string, category = 'user_interaction'): void {
    this.track({
      action,
      category
    });
    performanceMonitor.recordInteraction();
  }

  trackError(error: string, category = 'error'): void {
    this.track({
      action: 'error',
      category,
      label: error
    });
    performanceMonitor.recordError();
  }
}

export const analytics = new SimpleAnalytics();

// Error boundary helper
export const logError = (error: Error, errorInfo?: any) => {
  console.error('Error caught by boundary:', error, errorInfo);
  analytics.trackError(error.message);
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.startTimer('pageLoad');
    setTimeout(() => {
      performanceMonitor.endTimer('pageLoad');
    }, 0);
  });
}