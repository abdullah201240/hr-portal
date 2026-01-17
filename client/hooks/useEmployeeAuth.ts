'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/api';

export const useEmployeeAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('employeeAuthToken') : null;
      const profile = typeof window !== 'undefined' ? localStorage.getItem('employeeProfile') : null;
      
      if (token) {
        setIsAuthenticated(true);
        if (profile) {
          setEmployeeProfile(JSON.parse(profile));
          setIsLoading(false);
        } else {
          // If profile is missing but token exists, fetch it
          try {
            const response = await employeeApi.getProfile();
            if (response.success) {
              setEmployeeProfile(response.data);
              localStorage.setItem('employeeProfile', JSON.stringify(response.data));
            } else {
              // If token is invalid
              logout();
            }
          } catch (error) {
            console.error('Error fetching employee profile:', error);
            // Don't logout on network error, only on 401 which is handled by api.ts
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('employeeAuthToken');
    localStorage.removeItem('employeeProfile');
    setIsAuthenticated(false);
    setEmployeeProfile(null);
    router.push('/login/employee');
  };

  return { isAuthenticated, isLoading, employeeProfile, logout };
};
