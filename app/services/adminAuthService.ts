import { ethers } from 'ethers';

const API_URL = '/api';

export interface AdminAuthResponse {
  authorized: boolean;
  sessionToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  address?: string;
  loginTime?: number;
  error?: string;
}

/**
 * Send admin verification request to backend
 * Requires wallet address and signed message
 */
export const verifyAdminWithBackend = async (
  address: string,
  signature: string,
  message: string
): Promise<AdminAuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        address,
        signature,
        message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        authorized: false,
        error: data.error || 'Verification failed'
      };
    }

    return data;
  } catch (error: any) {
    console.error('Backend verification error:', error);
    return {
      authorized: false,
      error: error.message || 'Connection to backend failed'
    };
  }
};

/**
 * Validate existing session token with backend
 * Returns true if token is still valid
 */
export const validateSessionToken = async (token: string): Promise<SessionValidationResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/validate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        error: data.error || 'Session validation failed'
      };
    }

    return data;
  } catch (error: any) {
    console.error('Session validation error:', error);
    return {
      valid: false,
      error: error.message || 'Connection to backend failed'
    };
  }
};

/**
 * Logout and invalidate session
 */
export const logoutAdmin = async (token: string): Promise<void> => {
  try {
    await fetch(`${API_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Get admin config (public, no sensitive data)
 */
export const getAdminConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/config`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Config fetch error:', error);
    return { status: 'ready' };
  }
};

/**
 * Create authentication message with nonce
 * Used to prevent replay attacks
 */
export const createAuthMessage = (): { message: string; nonce: string; timestamp: number } => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 10);

  const message = `KickOff Rivals Verification Request

Nonce: ${nonce}
Timestamp: ${timestamp}

By signing this message, you verify your wallet access to KickOff Rivals.
This action will not cost gas.`;

  return { message, nonce, timestamp };
};

/**
 * Store session token in localStorage
 */
export const storeSessionToken = (token: string, expiresIn: number): void => {
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem('adminSessionToken', token);
  localStorage.setItem('adminTokenExpiry', expiryTime.toString());
};

/**
 * Retrieve session token from localStorage
 */
export const getSessionToken = (): string | null => {
  const token = localStorage.getItem('adminSessionToken');
  const expiry = localStorage.getItem('adminTokenExpiry');

  if (!token || !expiry) {
    return null;
  }

  // Check if token has expired
  if (Date.now() > parseInt(expiry)) {
    clearSessionToken();
    return null;
  }

  return token;
};

/**
 * Clear session token from localStorage
 */
export const clearSessionToken = (): void => {
  localStorage.removeItem('adminSessionToken');
  localStorage.removeItem('adminTokenExpiry');
};

/**
 * Check if user has valid admin session
 */
export const hasValidAdminSession = async (): Promise<boolean> => {
  const token = getSessionToken();

  if (!token) {
    return false;
  }

  const validation = await validateSessionToken(token);
  return validation.valid;
};
