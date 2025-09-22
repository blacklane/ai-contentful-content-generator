/**
 * HTTP client with authentication support
 * Handles API requests with automatic token management
 */

import { authManager } from './auth.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

class HttpClient {
  private baseUrl: string;

  constructor() {
    // Use relative URLs for production deployment
    this.baseUrl = '';
  }

  /**
   * Make authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = false,
    } = options;

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add authentication header if required and available
      if (requiresAuth) {
        if (!authManager.isAuthenticated()) {
          throw new Error('Authentication required');
        }

        const authHeaders = authManager.getAuthHeader();
        Object.assign(requestHeaders, authHeaders);
      }

      // Prepare request config
      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: 'same-origin', // Important for production deployment
      };

      // Add body for non-GET requests
      if (body !== undefined && method !== 'GET') {
        if (typeof body === 'string') {
          requestConfig.body = body;
        } else {
          requestConfig.body = JSON.stringify(body);
        }
      }

      // Make request
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, requestConfig);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        if (requiresAuth && authManager.isAuthenticated()) {
          // Token might be expired, logout user
          authManager.logout();
        }

        const errorData = await this.parseResponse(response);
        return {
          success: false,
          message: errorData.message || 'Authentication failed',
          code: errorData.code || 'AUTH_FAILED',
        };
      }

      // Parse response
      const result = await this.parseResponse<T>(response);

      // Return success/error based on response
      if (response.ok) {
        return {
          success: true,
          data: result.data || result,
          message: result.message,
        };
      } else {
        return {
          success: false,
          message: result.message || `HTTP ${response.status}`,
          code: result.code || 'HTTP_ERROR',
        };
      }
    } catch (error) {
      console.error('HTTP request failed:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'REQUEST_ERROR',
      };
    }
  }

  /**
   * Parse response JSON safely
   */
  private async parseResponse<T>(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        console.warn('Failed to parse JSON response:', error);
        return {};
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return { message: text };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<ApiResponse> {
    return this.get('/api/health');
  }

  /**
   * Generate content (protected)
   */
  async generateContent(data: any): Promise<ApiResponse> {
    return this.post('/api/generate', data, { requiresAuth: true });
  }

  /**
   * Publish content (protected)
   */
  async publishContent(data: any): Promise<ApiResponse> {
    return this.post('/api/publish', data, { requiresAuth: true });
  }
}

// Create singleton instance
export const httpClient = new HttpClient();
