import CryptoJS from 'crypto-js';

// Generate encryption key based on environment and browser fingerprint
const generateEncryptionKey = (): string => {
  const baseKey = import.meta.env.VITE_ENCRYPTION_KEY || 'AAI_INVENTORY_DEFAULT_KEY_2024';
  
  // Browser fingerprinting for device-specific encryption
  const browserFingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0
  ].join('|');
  
  return CryptoJS.SHA256(baseKey + browserFingerprint).toString();
};

/**
 * Helper function to check if a string is plain JSON (not encrypted)
 * @param data - String to check
 * @returns True if it's parseable JSON, false if encrypted
 */
const isPlainJSON = (data: string): boolean => {
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
};

/**
 * Encrypts a token using AES encryption
 * @param token - The authentication token to encrypt
 * @returns Encrypted token string with prefix
 */
export const encryptToken = (token: string): string => {
  try {
    if (!token || token.trim().length === 0) {
      throw new Error('Token cannot be empty');
    }

    const encryptionKey = generateEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(token, encryptionKey).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Token encryption failed:', error);
    return token;
  }
};

/**
 * Decrypts an encrypted token
 * @param encryptedToken - The encrypted token string
 * @returns Decrypted token string or null if decryption fails
 */
export const decryptToken = (encryptedToken: string): string | null => {
  try {
    if (!encryptedToken) {
      return null;
    }
    
    const tokenData = encryptedToken
    const encryptionKey = generateEncryptionKey();
    
    const decrypted = CryptoJS.AES.decrypt(tokenData, encryptionKey);
    const decryptedToken = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedToken || decryptedToken.length === 0) {
      console.error('Token decryption failed: Empty result');
      return null;
    }
    
    return decryptedToken;
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
};

/**
 * Securely stores a token in localStorage with encryption
 * @param token - The authentication token to store
 */
export const setSecureToken = (token: string): void => {
  try {
    if (!token || token.trim().length === 0) {
      console.error('Cannot store empty token');
      return;
    }

    const encryptedToken = encryptToken(token);
    localStorage.setItem('token', encryptedToken);
  } catch (error) {
    console.error('Failed to store secure token:', error);
  }
};

/**
 * Retrieves and decrypts a token from localStorage
 * @returns Decrypted token string or null if not found/invalid
 */
export const getSecureToken = (): string | null => {
  try {
    const encryptedToken = localStorage.getItem('token');
    if (!encryptedToken) {
      return null;
    }
    
    const decryptedToken = decryptToken(encryptedToken);
    
    if (!decryptedToken) {
      console.warn('Corrupted token detected, cleaning up...');
      removeSecureToken();
      return null;
    }
    
    return decryptedToken;
  } catch (error) {
    console.error('Failed to retrieve secure token:', error);
    removeSecureToken();
    return null;
  }
};

/**
 * Removes the encrypted token, user data and metadata from localStorage
 */
export const removeSecureToken = (): void => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove any legacy metadata if it exists
    localStorage.removeItem('token_meta');
  } catch (error) {
    console.error('Failed to remove secure token:', error);
  }
};

/**
 * Validates if a token exists and is properly accessible
 * @returns boolean indicating if a valid token exists
 */
export const hasValidToken = (): boolean => {
  try {
    const token = getSecureToken();
    return token !== null && token.length > 0;
  } catch {
    return false;
  }
};

/**
 * Gets basic token status without revealing sensitive metadata
 * @returns Object containing minimal token information
 */
export const getTokenStatus = () => {
  try {
    const hasToken = localStorage.getItem('token') !== null;
    const tokenValue = localStorage.getItem('token') || '';
    
    return {
      hasToken,
      isEncrypted: tokenValue.length > 0 && !tokenValue.startsWith('eyJ') && !tokenValue.includes('.'),
    };
  } catch (error) {
    console.error('Failed to get token status:', error);
    return {
      hasToken: false,
      isEncrypted: false,
    };
  }
};

/**
 * Encrypts user data using AES encryption
 * @param userData - The user data object to encrypt
 * @returns Encrypted user data string
 */
export const encryptUserData = (userData: any): string => {
  try {
    if (!userData) {
      throw new Error('User data cannot be empty');
    }

    const userDataString = JSON.stringify(userData);
    const encryptionKey = generateEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(userDataString, encryptionKey).toString();
    
    return encrypted;
  } catch (error) {
    console.error('User data encryption failed:', error);
    return JSON.stringify(userData);
  }
};

/**
 * Decrypts encrypted user data
 * @param encryptedUserData - The encrypted user data string
 * @returns Decrypted user data object or null if decryption fails
 */
export const decryptUserData = (encryptedUserData: string): any | null => {
  try {
    if (!encryptedUserData) {
      return null;
    }
    
    const userData = encryptedUserData;
    const encryptionKey = generateEncryptionKey();
    
    const decrypted = CryptoJS.AES.decrypt(userData, encryptionKey);
    const decryptedUserData = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedUserData || decryptedUserData.length === 0) {
      console.error('User data decryption failed: Empty result');
      return null;
    }
    
    return JSON.parse(decryptedUserData);
  } catch (error) {
    console.error('User data decryption failed:', error);
    return null;
  }
};

/**
 * Securely stores user data in localStorage with encryption
 * @param userData - The user data object to store
 */
export const setSecureUserData = (userData: any): void => {
  try {
    if (!userData) {
      console.error('Cannot store empty user data');
      return;
    }

    const encryptedUserData = encryptUserData(userData);
    localStorage.setItem('user', encryptedUserData);
  } catch (error) {
    console.error('Failed to store secure user data:', error);
  }
};

/**
 * Retrieves and decrypts user data from localStorage
 * @returns Decrypted user data object or null if not found/invalid
 */
export const getSecureUserData = (): any | null => {
  try {
    const encryptedUserData = localStorage.getItem('user');
    if (!encryptedUserData) {
      return null;
    }
    
    const decryptedUserData = decryptUserData(encryptedUserData);
    
    if (!decryptedUserData) {
      console.warn('Corrupted user data detected, cleaning up...');
      localStorage.removeItem('user');
      return null;
    }
    
    return decryptedUserData;
  } catch (error) {
    console.error('Failed to retrieve secure user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Migrates existing unencrypted user data to encrypted storage
 */
export const migrateToEncryptedUserData = (): boolean => {
  try {
    const existingUserData = localStorage.getItem('user');
    
    if (existingUserData && isPlainJSON(existingUserData)) {
      try {
        const userData = JSON.parse(existingUserData);
        setSecureUserData(userData);
        return true;
      } catch (parseError) {
        console.error('Failed to parse existing user data:', parseError);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('User data migration failed:', error);
    return false;
  }
};

/**
 * Migrates an existing unencrypted token to encrypted storage
 * Call this during app initialization to upgrade existing tokens
 */
export const migrateToEncryptedToken = (): boolean => {
  try {
    const existingToken = localStorage.getItem('token');
    
    // Check if token looks like a JWT (unencrypted) - JWTs typically start with "eyJ"
    if (existingToken && (existingToken.startsWith('eyJ') || existingToken.includes('.'))) {
      setSecureToken(existingToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token migration failed:', error);
    return false;
  }
};