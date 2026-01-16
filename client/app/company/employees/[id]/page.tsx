'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {  User, MapPin, Briefcase, Building, FileText, Users, CreditCard, Shield, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types/employee';
import Image from 'next/image';

const EmployeeDetailsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
  const router = useRouter();
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login/company');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch employee data
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return; // Don't fetch if still loading auth or not authenticated
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await employeeApi.getEmployeeById(Number(id));
        if (response.success) {
          setEmployee(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch employee');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error('Failed to fetch employee');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, isAuthenticated, authLoading]);

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state for employee data
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div >
          <Skeleton className="h-12 w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show not found if no employee exists
  if (!employee) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div >
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive">Employee not found</h2>
            <p className="text-muted-foreground mt-2">The requested employee could not be found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div >
        

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="rounded-full">
                <Image src={employee.image ? (employee.image.startsWith('data:') ? employee.image : `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${employee.image}`) : '/placeholder-avatar.png'} alt={employee.name} width={100} height={100} className="rounded-full" unoptimized />
                
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {employee.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {employee.designation || 'N/A'}</span>
                  <span className="flex items-center"><Building className="h-4 w-4 mr-1" /> {employee.department || 'N/A'}</span>
                  <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> ID: {employee.employeeId}</span>
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => router.push(`/company/employees/${id}/edit`)}
              className="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Edit className="h-4 w-4" />
              Edit Employee
            </Button>
          </div>
        </motion.div>

        {/* Main Info Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">{employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{employee.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{employee.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium">{employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium">{employee.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood Group</span>
                <span className="font-medium">{employee.bloodGroup || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Employment Information
              </CardTitle>
              <CardDescription>Job-related details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-medium">{employee.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{employee.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Designation</span>
                <span className="font-medium">{employee.designation || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Join Date</span>
                <span className="font-medium">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium">{employee.salary ? '৳' + parseFloat(employee.salary).toFixed(2) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Additional Information
              </CardTitle>
              <CardDescription>Other relevant details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marital Status</span>
                <span className="font-medium">{employee.maritalStatus || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee Type</span>
                <span className="font-medium">{employee.employeeType || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personal Mobile</span>
                <span className="font-medium">{employee.personalMobile || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* More Details Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                Address Information
              </CardTitle>
              <CardDescription>Current address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Current Address</h4>
                <p className="text-muted-foreground">{employee.currentAddress || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Contact information for emergencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{employee.emergencyContactNumber || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personal Mobile</span>
                <span className="font-medium">{employee.personalMobile || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Information */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Bank Information
              </CardTitle>
              <CardDescription>Financial account details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Bank Name</h4>
                <p className="font-medium">{employee.bankName || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Account Number</h4>
                <p className="font-medium">{employee.accountNumber || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                <p className="font-medium">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Updated At</h4>
                <p className="font-medium">{employee.updated_at ? new Date(employee.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;