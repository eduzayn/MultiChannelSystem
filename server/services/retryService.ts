/**
 * Serviço para implementação de retry logic e circuit breaker
 */
class RetryService {
  /**
   * Executa uma função com retry logic
   * @param fn Função a ser executada
   * @param options Opções de configuração
   * @returns Resultado da função
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      exponentialBackoff?: boolean;
      onRetry?: (error: Error, attempt: number) => void;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      onRetry = (error, attempt) => console.warn(`Tentativa ${attempt} falhou:`, error.message),
      shouldRetry = () => true
    } = options;

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt <= maxRetries && shouldRetry(lastError)) {
          onRetry(lastError, attempt);
          
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt - 1)
            : retryDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Circuit Breaker para proteger contra falhas em cascata
   */
  createCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      onOpen?: () => void;
      onClose?: () => void;
      onHalfOpen?: () => void;
      fallbackFn?: () => Promise<T>;
    } = {}
  ) {
    const {
      failureThreshold = 5,
      resetTimeout = 30000,
      onOpen = () => console.warn('Circuit breaker aberto'),
      onClose = () => console.info('Circuit breaker fechado'),
      onHalfOpen = () => console.info('Circuit breaker em half-open'),
      fallbackFn
    } = options;

    let failures = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    let lastFailureTime: number | null = null;

    return async (): Promise<T> => {
      if (state === 'OPEN') {
        if (lastFailureTime && Date.now() - lastFailureTime >= resetTimeout) {
          state = 'HALF_OPEN';
          onHalfOpen();
        } else {
          if (fallbackFn) {
            return fallbackFn();
          }
          throw new Error('Circuit breaker está aberto');
        }
      }

      try {
        const result = await fn();
        
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          onClose();
        }
        
        failures = 0;
        return result;
      } catch (error) {
        lastFailureTime = Date.now();
        failures++;
        
        if ((state === 'CLOSED' && failures >= failureThreshold) || state === 'HALF_OPEN') {
          state = 'OPEN';
          onOpen();
        }
        
        if (fallbackFn) {
          return fallbackFn();
        }
        
        throw error;
      }
    };
  }
}

export const retryService = new RetryService();
