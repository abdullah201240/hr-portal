// hooks/useCompanyAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { companyApi } from '@/lib/api';

export const useCompanyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by checking for company token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('companyAuthToken') : null;
    console.log('useCompanyAuth - Token check:', token ? 'Token exists' : 'No token found');
    setIsAuthenticated(!!token);
    
    // Load company profile if available in localStorage from login
    if (token) {
      try {
        const storedProfile = localStorage.getItem('companyProfile');
        console.log('useCompanyAuth - Profile check:', storedProfile ? 'Profile exists' : 'No profile found');
        if (storedProfile) {
          setCompanyProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error('Error loading company profile:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string, profile?: any) => {
    localStorage.setItem('companyAuthToken', token);
    if (profile) {
      localStorage.setItem('companyProfile', JSON.stringify(profile));
      setCompanyProfile(profile);
    }
    setIsAuthenticated(true);
  };

  const updateCompanyProfile = (profile: any) => {
    setCompanyProfile(profile);
    localStorage.setItem('companyProfile', JSON.stringify(profile));
  };

  const logout = async () => {
    try {
      // Call the server-side logout endpoint if it exists
      await companyApi.logoutCompany();
    } catch (error) {
      // Even if server logout fails, still clear local token and redirect
      console.error('Server logout failed:', error);
    } finally {
      // Clear the local token regardless of server response
      localStorage.removeItem('companyAuthToken');
      localStorage.removeItem('companyProfile');
      setCompanyProfile(null);
      setIsAuthenticated(false);
      toast.success('Successfully logged out');
      router.push('/login/company');
    }
  };

  return { isAuthenticated, isLoading, companyProfile, setCompanyProfile: updateCompanyProfile, login, logout };
};