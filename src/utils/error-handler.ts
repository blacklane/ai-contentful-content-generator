export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  details?: any;
}

export const createErrorResponse = (
  error: string,
  message: string,
  details?: any,
): ErrorResponse => ({
  error,
  message,
  timestamp: new Date().toISOString(),
  ...(details && { details }),
});

export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  errorContext: string,
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`❌ ${errorContext}:`, error);
    throw new Error(`${errorContext}: ${error.message}`);
  }
};

export const logError = (context: string, error: any) => {
  console.error(`❌ ${context}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  }
};
