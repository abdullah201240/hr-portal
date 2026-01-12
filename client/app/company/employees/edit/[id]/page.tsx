'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import EmployeeForm from '../../EmployeeForm';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types/employee';
import { toast } from 'sonner';

export default function EditEmployeePage() {
  const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
  const router = useRouter();
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login/company');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await employeeApi.getEmployeeById(Number(id));
        if (response.success) {
          setEmployee(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch employee');
          router.push('/company/employees');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error('Failed to fetch employee');
        router.push('/company/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !employee) {
    return null;
  }

  return (
    <div className="bg-background">
      <div>
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
          <EmployeeForm 
            employee={employee} 
            onSuccess={() => {
              toast.success('Employee updated successfully');
              router.push('/company/employees');
            }} 
          />
        </div>
      </div>
    </div>
  );
}