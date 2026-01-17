'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useEmployeeAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const profile = typeof window !== 'undefined' ? localStorage.getItem('employeeProfile') : null;
    
    if (token) {
      setIsAuthenticated(true);
      if (profile) {
        setEmployeeProfile(JSON.parse(profile));
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('employeeProfile');
    setIsAuthenticated(false);
    setEmployeeProfile(null);
    router.push('/login/employee');
  };

  return { isAuthenticated, isLoading, employeeProfile, logout };
};
