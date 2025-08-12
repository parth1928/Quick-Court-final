import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData, getAuthToken } from '@/lib/token-utils';

export interface UseAuthOptions {
  required?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
}

export function useAuth(options: UseAuthOptions = {}): AuthState {
  const {
    required = false,
    requiredRole,
    redirectTo = '/login'
  } = options;
  
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    hasRequiredRole: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = getAuthData();
        const token = getAuthToken();
        
        if (authData && token) {
          const hasRequiredRole = !requiredRole || authData.user.role === requiredRole;
          
          setAuthState({
            user: authData.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            hasRequiredRole,
          });

          // Redirect if role requirement not met
          if (requiredRole && !hasRequiredRole) {
            console.log(`Role check failed. Required: ${requiredRole}, Actual: ${authData.user.role}`);
            router.push(getDefaultRouteForRole(authData.user.role));
          }
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasRequiredRole: false,
          });

          // Redirect if authentication is required
          if (required) {
            console.log('Authentication required, redirecting to login');
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          hasRequiredRole: false,
        });

        if (required) {
          router.push(redirectTo);
        }
      }
    };

    checkAuth();
  }, [required, requiredRole, redirectTo, router]);

  return authState;
}

function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'owner':
      return '/facility-dashboard';
    case 'user':
      return '/user-home';
    default:
      return '/login';
  }
}
