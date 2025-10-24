import { useEffect, useState, useCallback, useRef } from 'react';
import { TokenValidator } from '../utils/tokenValidator';

/**
 * Hook for token validation with automatic logout
 * @param validateOnMount - Whether to validate token when component mounts
 * @param intervalMs - Auto-validation interval in milliseconds (0 to disable)
 * @returns Object with validation state and manual validation function
 */
export const useTokenValidation = (
  validateOnMount = false,
  intervalMs = 0
) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const validateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const validateToken = useCallback(async (force = false) => {
    if (isValidating && !force) return isValid;

    setIsValidating(true);
    try {
      const valid = await TokenValidator.validateToken(force);
      setIsValid(valid);
      return valid;
    } catch (error) {
      console.error('Token validation error:', error);
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [isValidating, isValid]);

  // Debounced validation to prevent rapid calls
  const debouncedValidate = useCallback((force = false) => {
    if (validateTimeoutRef.current) {
      clearTimeout(validateTimeoutRef.current);
    }
    
    validateTimeoutRef.current = setTimeout(() => {
      validateToken(force);
    }, 100); // 100ms debounce
  }, [validateToken]);

  // Initial validation on mount (only if explicitly requested)
  useEffect(() => {
    if (validateOnMount) {
      // Use cached result first, don't force validation
      const hasLocalToken = TokenValidator.hasLocalToken();
      if (hasLocalToken) {
        debouncedValidate();
      } else {
        setIsValid(false);
      }
    }
  }, [validateOnMount, debouncedValidate]);

  // Periodic validation (use with caution)
  useEffect(() => {
    if (intervalMs > 0) {
      const interval = setInterval(() => debouncedValidate(), intervalMs);
      return () => clearInterval(interval);
    }
  }, [intervalMs, debouncedValidate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current);
      }
    };
  }, []);

  return {
    isValid,
    isValidating,
    validateToken: useCallback((force = false) => debouncedValidate(force), [debouncedValidate]),
    hasLocalToken: TokenValidator.hasLocalToken()
  };
};