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
  };
  code?: string;
}

export interface AuthStatus {
  success: boolean;
  data?: {
    authEnabled: boolean;
    requiresAuth: boolean;
  };
}

export interface TokenVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    userId: string;
    issuedAt: number;
  };
  code?: string;
}

class AuthManager {
  private token: string | null = null;
  private readonly TOKEN_KEY = 'auth_token';

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
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.clearStoredToken();
    }
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
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
    } catch (error) {
      console.error('Error clearing stored token:', error);
    }
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
        this.redirectToLogin();
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

        // Save token to localStorage
        this.saveTokenToStorage(result.data.token);
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
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.add('hidden');
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.add('hidden');
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

    // Show sidebar using Tailwind CSS class
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('hidden');
    }

    // Show main app content using Tailwind CSS class
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.remove('hidden');
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
