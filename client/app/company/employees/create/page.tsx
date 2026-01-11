'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import EmployeeForm from '../EmployeeForm';

export default function CreateEmployeePage() {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-background">
      <div >
        

        
          <div >
            <EmployeeForm onSuccess={() => router.push('/company/employees')} />
          </div>
        
      </div>
    </div>
  );
}
