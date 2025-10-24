import { TokenValidator } from './tokenValidator';

/**
 * Critical action validator - only validates tokens before sensitive operations
 * This prevents unnecessary validation on every route/component load
 */
export class CriticalActionValidator {
  private static readonly CRITICAL_ACTIONS = [
    'user-management',
    'inventory-modification',
    'system-settings',
    'data-export',
    'role-changes'
  ];

  /**
   * Validates token before critical actions only
   * @param actionType - Type of action being performed
   * @returns Promise<boolean> - true if validated and allowed to proceed
   */
  static async validateForAction(actionType: string): Promise<boolean> {
    // Only validate for critical actions
    if (!this.CRITICAL_ACTIONS.includes(actionType)) {
      return TokenValidator.hasLocalToken();
    }

    // For critical actions, always validate with backend
    return await TokenValidator.validateToken(true);
  }

  /**
   * Middleware for API calls that need validation
   * @param apiCall - Function that makes the API call
   * @param actionType - Type of action (optional)
   * @returns Promise with API call result or throws if invalid token
   */
  static async withValidation<T>(
    apiCall: () => Promise<T>, 
    actionType?: string
  ): Promise<T> {
    const isValid = actionType 
      ? await this.validateForAction(actionType)
      : TokenValidator.hasLocalToken();

    if (!isValid) {
      throw new Error('Authentication required');
    }

    return await apiCall();
  }

  /**
   * Check if an action requires critical validation
   */
  static isCriticalAction(actionType: string): boolean {
    return this.CRITICAL_ACTIONS.includes(actionType);
  }
}