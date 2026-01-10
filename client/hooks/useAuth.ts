// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by checking for token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    router.push('/login/company');
  };

  return { isAuthenticated, isLoading, login, logout };
};