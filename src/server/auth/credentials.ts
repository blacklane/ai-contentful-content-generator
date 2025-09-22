import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  username?: string;
}

export class CredentialsManager {
  private static readonly SALT_ROUNDS = 10;

  private expectedUsername: string;
  private expectedPassword: string;

  constructor() {
    this.expectedUsername = process.env.AUTH_USERNAME || '';
    this.expectedPassword = process.env.AUTH_PASSWORD || '';

    if (!this.expectedUsername || !this.expectedPassword) {
      console.error(
        'AUTH_USERNAME and AUTH_PASSWORD must be set in environment variables',
      );
      throw new Error('Authentication credentials not configured');
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, CredentialsManager.SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hashed password
   */
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate login credentials
   * For now, we use plain text comparison since password is stored in env
   * In production, you might want to store hashed passwords
   */
  async validateCredentials(
    credentials: LoginCredentials,
  ): Promise<AuthResult> {
    const { username, password } = credentials;

    // Input validation
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required',
      };
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return {
        success: false,
        message: 'Invalid credential format',
      };
    }

    // Trim whitespace
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return {
        success: false,
        message: 'Username and password cannot be empty',
      };
    }

    // Check credentials
    const usernameMatch = trimmedUsername === this.expectedUsername;
    const passwordMatch = trimmedPassword === this.expectedPassword;

    if (!usernameMatch || !passwordMatch) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve =>
        setTimeout(resolve, 100 + Math.random() * 200),
      );

      return {
        success: false,
        message: 'Invalid username or password',
      };
    }

    return {
      success: true,
      message: 'Authentication successful',
      username: trimmedUsername,
    };
  }

  /**
   * Check if authentication is properly configured
   */
  isConfigured(): boolean {
    return !!(this.expectedUsername && this.expectedPassword);
  }

  /**
   * Get configured username (for validation purposes)
   */
  getExpectedUsername(): string {
    return this.expectedUsername;
  }
}

// Singleton instance
export const credentialsManager = new CredentialsManager();
