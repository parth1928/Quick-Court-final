"use client"

import { useEffect, useState } from 'react';
import { getAuthToken, getAuthData, isTokenExpired } from '@/lib/token-utils';

export default function AuthDebugPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const tokenStr = localStorage.getItem('token');
    const authData = getAuthData();
    const token = getAuthToken();

    const debugInfo = {
      hasUserInStorage: !!userStr,
      hasTokenInStorage: !!tokenStr,
      userFromStorage: userStr ? JSON.parse(userStr) : null,
      tokenFromStorage: tokenStr,
      authDataFromUtil: authData,
      tokenFromUtil: token,
      tokenExpired: token ? isTokenExpired(token) : null,
      allLocalStorageKeys: Object.keys(localStorage),
    };

    setAuthInfo(debugInfo);
  }, []);

  const testApiCall = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('No token available');
        return;
      }

      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('API call successful!');
      } else {
        alert(`API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`API call error: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!authInfo) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Info</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Quick Status</h2>
          <p>User in Storage: {authInfo.hasUserInStorage ? '✅' : '❌'}</p>
          <p>Token in Storage: {authInfo.hasTokenInStorage ? '✅' : '❌'}</p>
          <p>Token Expired: {authInfo.tokenExpired ? '❌' : '✅'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={testApiCall}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Test API Call
            </button>
            <button 
              onClick={clearAuth}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Auth Data
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Detailed Info</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
