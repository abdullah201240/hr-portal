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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/company/employees')}
            className="mb-4 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Add New Employee
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill in the information below to register a new employee in your company.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border-border/50 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/5"
        >
          <div className="p-6 md:p-8">
            <EmployeeForm onSuccess={() => router.push('/company/employees')} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
