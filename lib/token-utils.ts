/**
 * Utility functions for handling authentication tokens
 */

export interface AuthData {
  user: any;
  token: string;
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // Assume expired if we can't parse it
  }
}

/**
 * Gets the authentication token from localStorage
 * Tries localStorage.token first, then user.token as fallback
 */
export function getAuthToken(): string | null {
  try {
    // Try direct token first
    let token = localStorage.getItem("token");
    
    if (!token) {
      // Try getting token from user object
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      }
    }
    
    // Check if token is expired
    if (token && isTokenExpired(token)) {
      console.warn('Token is expired');
      clearAuth();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Gets both user data and token
 */
export function getAuthData(): AuthData | null {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    const token = getAuthToken();
    
    if (!token) return null;
    
    return { user, token };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
}

/**
 * Creates authorization header for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Checks if user is authenticated and has required role
 */
export function checkAuth(requiredRole?: string): boolean {
  const authData = getAuthData();
  if (!authData) return false;
  
  if (requiredRole && authData.user.role !== requiredRole) {
    return false;
  }
  
  return true;
}

/**
 * Clears authentication data from localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
