/**
 * Authentication management module
 * Handles login, token storage, and session management
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    username: string;
    expiresIn: number;
    sessionDuration: number;
  };
  code?: string;
}

export interface AuthStatus {
  success: boolean;
  data?: {
    authEnabled: boolean;
    sessionDuration: number;
    requiresAuth: boolean;
  };
}

export interface TokenVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    userId: string;
    expiresIn: number;
    issuedAt: number;
    expiresAt: number;
  };
  code?: string;
}

class AuthManager {
  private token: string | null = null;
  private sessionTimeout: number | null = null;
  private sessionDuration: number = 25 * 60 * 1000; // 25 minutes in milliseconds
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry';

  constructor() {
    this.loadTokenFromStorage();
    this.setupAutoLogout();
  }

  /**
   * Load token from localStorage on initialization
   */
  private loadTokenFromStorage(): void {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry);
        const currentTime = Date.now();

        if (currentTime < expiryTime) {
          this.token = storedToken;
          this.startSessionTimer(expiryTime - currentTime);
        } else {
          // Token expired, clean up
          this.clearStoredToken();
        }
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.clearStoredToken();
    }
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(token: string, expiresIn: number): void {
    try {
      const expiryTime = Date.now() + expiresIn;
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing stored token:', error);
    }
  }

  /**
   * Start session timer for auto-logout
   */
  private startSessionTimer(timeRemaining: number): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = window.setTimeout(() => {
      this.handleSessionExpired();
    }, timeRemaining);
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    console.log('Session expired, logging out...');
    this.logout();
    this.showSessionExpiredMessage();
  }

  /**
   * Show session expired message
   */
  private showSessionExpiredMessage(): void {
    const message = document.createElement('div');
    message.className =
      'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    message.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Session expired. Please log in again.</span>
      </div>
    `;

    document.body.appendChild(message);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }

  /**
   * Setup auto-logout functionality
   */
  private setupAutoLogout(): void {
    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', e => {
      if (e.key === this.TOKEN_KEY && !e.newValue) {
        // Token was removed in another tab
        this.token = null;
        if (this.sessionTimeout) {
          clearTimeout(this.sessionTimeout);
          this.sessionTimeout = null;
        }
        this.redirectToLogin();
      }
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isAuthenticated()) {
        // Page became visible, verify token is still valid
        this.verifyToken().catch(() => {
          this.logout();
        });
      }
    });
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.data) {
        this.token = result.data.token;
        this.sessionDuration = result.data.sessionDuration;

        // Save token and start session timer
        this.saveTokenToStorage(result.data.token, result.data.expiresIn);
        this.startSessionTimer(result.data.expiresIn);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error during login',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.token = null;
    this.clearStoredToken();

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    this.redirectToLogin();
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<TokenVerifyResponse> {
    if (!this.token) {
      return {
        success: false,
        message: 'No token available',
        code: 'NO_TOKEN',
      };
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token }),
      });

      const result: TokenVerifyResponse = await response.json();

      if (!result.success) {
        this.logout();
      }

      return result;
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Network error during token verification',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Get authentication status from server
   */
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      const response = await fetch('/api/auth/status');
      return await response.json();
    } catch (error) {
      console.error('Error getting auth status:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get current token for API requests
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Redirect to login form
   */
  private redirectToLogin(): void {
    this.showLoginForm();
  }

  /**
   * Show login form
   */
  showLoginForm(): void {
    // Hide main app content
    const mainContent = document.querySelector('.lg\\:ml-64');
    if (mainContent) {
      (mainContent as HTMLElement).style.display = 'none';
    }

    // Show login form
    let loginContainer = document.getElementById('loginContainer');
    if (!loginContainer) {
      loginContainer = this.createLoginForm();
      document.body.appendChild(loginContainer);
    } else {
      loginContainer.style.display = 'flex';
    }
  }

  /**
   * Hide login form and show main app
   */
  hideLoginForm(): void {
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
      loginContainer.style.display = 'none';
    }

    // Show main app content
    const mainContent = document.querySelector('.lg\\:ml-64');
    if (mainContent) {
      (mainContent as HTMLElement).style.display = 'block';
    }
  }

  /**
   * Create login form HTML
   */
  private createLoginForm(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'loginContainer';
    container.className =
      'fixed inset-0 bg-cursor-bg flex items-center justify-center z-50 px-4';

    container.innerHTML = `
      <div class="card cursor-card p-6 sm:p-8  max-w-sm sm:max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="w-12 h-12 sm:w-14 sm:h-14 cursor-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-cursor-text mb-2">Authentication Required</h1>
          <p class="text-sm sm:text-base text-cursor-muted">Please log in to access</p>
        </div>

        <form id="loginForm" class="space-y-4 sm:space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-cursor-text">Username</label>
            <input
              type="text"
              id="loginUsername"
              class="input input-bordered w-full"
              placeholder="Enter your username"
              required
              autocomplete="username"
            />
            <div id="usernameError" class="text-error text-xs hidden"></div>
          </div>

          <div class="space-y-2">
            <label class="text-sm  font-medium text-cursor-text">Password</label>
            <input
              type="password"
              id="loginPassword"
              class="input input-bordered w-full"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
            <div id="passwordError" class="text-error text-xs hidden"></div>
          </div>

          <div id="loginError" class="text-error text-sm hidden"></div>

          <button
            type="submit"
            id="loginSubmit"
            class="btn cursor-gradient text-white hover:opacity-90 w-full"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Sign In
          </button>
        </form>

        <div class="mt-4 border-t border-cursor-border text-center">
          <p class="text-xs p-4 text-cursor-muted">
            Session duration: ${Math.floor(this.sessionDuration / (60 * 1000))} minutes
          </p>
        </div>
      </div>
    `;

    // Add event listeners
    const form = container.querySelector('#loginForm') as HTMLFormElement;
    form.addEventListener('submit', e => this.handleLoginSubmit(e));

    return container;
  }

  /**
   * Handle login form submission
   */
  private async handleLoginSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const usernameInput = document.getElementById(
      'loginUsername',
    ) as HTMLInputElement;
    const passwordInput = document.getElementById(
      'loginPassword',
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'loginSubmit',
    ) as HTMLButtonElement;
    const loginError = document.getElementById('loginError') as HTMLElement;

    // Clear previous errors
    this.clearLoginErrors();

    // Get values
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validate inputs
    if (!username) {
      this.showFieldError('usernameError', 'Username is required');
      return;
    }

    if (!password) {
      this.showFieldError('passwordError', 'Password is required');
      return;
    }

    // Disable form during login
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Signing In...
      </div>
    `;

    try {
      const result = await this.login({ username, password });

      if (result.success) {
        this.hideLoginForm();
      } else {
        loginError.textContent = result.message || 'Login failed';
        loginError.classList.remove('hidden');
      }
    } catch {
      loginError.textContent = 'Network error. Please try again.';
      loginError.classList.remove('hidden');
    } finally {
      // Re-enable form
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
        </svg>
        Sign In
      `;
    }
  }

  /**
   * Show field error
   */
  private showFieldError(errorId: string, message: string): void {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  /**
   * Clear login form errors
   */
  private clearLoginErrors(): void {
    const errorElements = ['usernameError', 'passwordError', 'loginError'];
    errorElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.add('hidden');
        element.textContent = '';
      }
    });
  }
}

// Create singleton instance
export const authManager = new AuthManager();
