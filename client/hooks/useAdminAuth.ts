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
    console.log('useAdminAuth - Token check:', token ? 'Token exists' : 'No token found');
    setIsAuthenticated(!!token);
    
    // Load admin profile if available in localStorage from login
    if (token) {
      try {
        const storedProfile = localStorage.getItem('adminProfile');
        console.log('useAdminAuth - Profile check:', storedProfile ? 'Profile exists' : 'No profile found');
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

  const updateAdminProfile = (profile: any) => {
    setAdminProfile(profile);
    localStorage.setItem('adminProfile', JSON.stringify(profile));
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
      localStorage.removeItem('adminProfile');
      setAdminProfile(null);
      setIsAuthenticated(false);
      toast.success('Successfully logged out');
      router.push('/login/admin');
    }
  };

  return { isAuthenticated, isLoading, adminProfile, setAdminProfile: updateAdminProfile, login, logout };
};