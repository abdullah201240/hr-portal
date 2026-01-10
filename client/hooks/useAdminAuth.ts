// hooks/useAdminAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by checking for token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsAuthenticated(!!token);
    
    // Load admin profile if available in localStorage from login
    if (token) {
      try {
        const storedProfile = localStorage.getItem('adminProfile');
        if (storedProfile) {
          setAdminProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error('Error loading admin profile:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call the server-side logout endpoint
      await adminApi.logoutAdmin();
    } catch (error) {
      // Even if server logout fails, still clear local token and redirect
      console.error('Server logout failed:', error);
    } finally {
      // Clear the local token regardless of server response
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      toast.success('Successfully logged out');
      router.push('/login/admin');
    }
  };

  return { isAuthenticated, isLoading, adminProfile, login, logout };
};