// Utilitários otimizados de performance

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

// Preload de rota para melhor UX
export const preloadRoute = async (routeComponent: () => Promise<any>) => {
  try {
    await routeComponent();
  } catch (error) {
    // Log silencioso em produção
    console.warn('⚠️ Falha ao precarregar rota:', error);
  }
};

// Detecção de dispositivo lento
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
class SimpleAnalytics {
  track(action: string, category?: string): void {
    // Log básico para analytics
    console.log(`📊 Analytics: ${action}${category ? ` (${category})` : ''}`);
  }

  trackPageView(page: string): void {
    this.track('page_view', page);
  }

  trackUserAction(action: string): void {
    this.track('user_action', action);
  }

  trackError(error: string): void {
    this.track('error', error);
    console.error('🚨 Analytics Error:', error);
  }
}

export const analytics = new SimpleAnalytics();

// Helper para logging de erros
export const logError = (error: Error, context?: string) => {
  console.error(`🚨 Error${context ? ` [${context}]` : ''}:`, error);
  analytics.trackError(error.message);
};

// Monitores de performance específicos
export const performanceUtils = {
  // Medir tempo de execução
  measure: <T>(label: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(`⚠️ Performance: ${label} levou ${duration.toFixed(2)}ms`);
    }
    
    return result;
  },

  // Medir tempo de execução async
  measureAsync: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 500) {
      console.warn(`⚠️ Performance: ${label} (async) levou ${duration.toFixed(2)}ms`);
    }
    
    return result;
  },

  // Obter uso de memória
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  },

  // Log de estatísticas
  logStats: (): void => {
    console.log('📊 Performance Stats:', {
      memoryUsage: `${performanceUtils.getMemoryUsage()}MB`,
      isSlowDevice: isSlowDevice(),
      isSlowConnection: isSlowConnection()
    });
  }
};

// Inicialização
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        performanceUtils.logStats();
      } catch {
        // Silencioso se houver erro
      }
    }, 2000);
  });
}