import AuthService from '../services/auth/AuthService';

/**
 * Token validation utility
 * Provides efficient, centralized token validation with automatic logout
 */
export class TokenValidator {
  private static validationPromise: Promise<boolean> | null = null;
  private static lastValidation = 0;
  private static cachedResult: boolean | null = null;
  private static readonly VALIDATION_CACHE_TIME = 300000;
  private static isValidating = false;

  /**
   * Validates token with backend (cached for 5 minutes to avoid redundant calls)
   * @param force - Force validation even if cached result exists
   * @returns Promise<boolean> - true if valid, false if invalid
   */
  static async validateToken(force = false): Promise<boolean> {
    const now = Date.now();
    
    // Return cached result if validation was recent and not forced
    if (!force && this.cachedResult !== null && (now - this.lastValidation < this.VALIDATION_CACHE_TIME)) {
      return this.cachedResult;
    }

    // If already validating, return the existing promise
    if (this.isValidating && this.validationPromise) {
      return this.validationPromise;
    }

    // Create new validation promise
    this.isValidating = true;
    this.lastValidation = now;
    this.validationPromise = this.performValidation(force);
    
    try {
      const result = await this.validationPromise;
      this.cachedResult = result;
      return result;
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Performs the actual token validation
   */
  private static async performValidation(force = false): Promise<boolean> {
    try {
      return await AuthService.validateToken(force);
    } catch (error) {
      // Reduce console noise - only log in development
      if (import.meta.env.DEV) {
        console.error('Token validation failed:', error);
      }
      return false;
    }
  }

  /**
   * Clears validation cache (call after login/logout)
   */
  static clearCache(): void {
    this.validationPromise = null;
    this.lastValidation = 0;
    this.cachedResult = null;
    this.isValidating = false;
  }

  /**
   * Quick local token check (no backend call)
   */
  static hasLocalToken(): boolean {
    return AuthService.isAuthenticated();
  }

  /**
   * Validates token and throws error if invalid (for use in components)
   * @throws Error if token is invalid
   */
  static async validateOrThrow(): Promise<void> {
    const isValid = await this.validateToken();
    if (!isValid) {
      throw new Error('Invalid authentication token');
    }
  }
}