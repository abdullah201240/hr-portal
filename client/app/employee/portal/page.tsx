'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { roleApi } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Shield,
  Eye,
  Pen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Define available employee features based on permissions
const EMPLOYEE_FEATURES = [
  {
    key: 'salary_view',
    name: 'Salary Information',
    icon: DollarSign,
    description: 'View your salary details and history',
    permission: 'can_view'
  },
  {
    key: 'attendance_management',
    name: 'Attendance',
    icon: Calendar,
    description: 'Clock in/out and view attendance records',
    permission: 'can_view'
  },
  {
    key: 'leave_management',
    name: 'Leave Requests',
    icon: FileText,
    description: 'Apply for leave and view leave balance',
    permission: 'can_view'
  },
  {
    key: 'team_management',
    name: 'Team Management',
    icon: Users,
    description: 'Manage your team members (if authorized)',
    permission: 'can_view'
  },
  {
    key: 'salary_management',
    name: 'Salary Processing',
    icon: DollarSign,
    description: 'Process salaries for team members (HR only)',
    permission: 'can_view'
  },
  {
    key: 'reports_generation',
    name: 'Reports',
    icon: FileText,
    description: 'Generate and view reports (authorized only)',
    permission: 'can_view'
  }
];

export default function EmployeePortal() {
  const router = useRouter();
  const { employeeProfile, isAuthenticated, isLoading } = useEmployeeAuth();
  const [employeeRoles, setEmployeeRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Session expired. Please log in again.');
      router.push('/login/employee');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (employeeProfile?.id && isAuthenticated) {
      fetchEmployeeRoles();
      fetchEmployeePermissions();
    }
  }, [employeeProfile?.id, isAuthenticated]);

  const fetchEmployeeRoles = async () => {
    try {
      const response = await roleApi.getEmployeeRoles(employeeProfile.id);
      if (response.success) {
        setEmployeeRoles(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching employee roles:', error);
    }
  };

  const fetchEmployeePermissions = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch actual permissions
      // For demo purposes, we'll simulate some permissions
      
      // Simulate HR team having salary management access
      const simulatedPermissions = [
        { feature_key: 'salary_view', can_view: true },
        { feature_key: 'attendance_management', can_view: true },
        { feature_key: 'leave_management', can_view: true },
        { feature_key: 'team_management', can_view: employeeProfile.department?.toLowerCase().includes('hr') },
        { feature_key: 'salary_management', can_view: employeeProfile.department?.toLowerCase().includes('hr') },
        { feature_key: 'reports_generation', can_view: employeeProfile.designation?.toLowerCase().includes('manager') }
      ];
      
      setPermissions(simulatedPermissions);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toast.error(error.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (featureKey: string): boolean => {
    return permissions.some(perm => perm.feature_key === featureKey && perm.can_view);
  };

  const handleFeatureClick = (feature: any) => {
    if (hasPermission(feature.key)) {
      // Navigate to the feature page
      switch (feature.key) {
        case 'salary_view':
          router.push('/employee/salary');
          break;
        case 'attendance_management':
          router.push('/employee/attendance');
          break;
        case 'leave_management':
          router.push('/employee/leave');
          break;
        case 'team_management':
          router.push('/employee/team');
          break;
        case 'salary_management':
          router.push('/employee/salary-processing');
          break;
        case 'reports_generation':
          router.push('/employee/reports');
          break;
        default:
          toast.info(`Navigating to ${feature.name}`);
      }
    } else {
      toast.error('You dont have permission to access this feature');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const accessibleFeatures = EMPLOYEE_FEATURES.filter(feature => hasPermission(feature.key));
  const restrictedFeatures = EMPLOYEE_FEATURES.filter(feature => !hasPermission(feature.key));

  return (
    <div className="bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Employee Portal
        </h1>
        <p className="text-muted-foreground">
          Welcome, {employeeProfile?.name}! Access your authorized features below.
        </p>
      </motion.div>

      {/* Employee Info Card */}
      <Card className="glass border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{employeeProfile?.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employeeProfile?.department || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{employeeProfile?.designation || 'Not assigned'}</p>
            </div>
          </div>
          
          {employeeRoles.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Assigned Roles</p>
              <div className="flex flex-wrap gap-2">
                {employeeRoles.map((role: any) => (
                  <Badge key={role.id} variant="secondary">
                    {role.role_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessible Features */}
      {accessibleFeatures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            Available Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => handleFeatureClick(feature)}
                >
                  <Card className="glass border-emerald-500/20 hover:border-emerald-500/40 transition-all h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-emerald-500" />
                        {feature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {feature.description}
                      </p>
                      <Badge variant="default" className="bg-emerald-500/20 text-emerald-500">
                        Access Granted
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Restricted Features */}
      {restrictedFeatures.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            Restricted Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restrictedFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="opacity-60"
                >
                  <Card className="glass border-red-500/20 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-red-500" />
                        {feature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {feature.description}
                      </p>
                      <Badge variant="destructive">
                        Access Denied
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {accessibleFeatures.length === 0 && restrictedFeatures.length === 0 && (
        <Card className="glass border-white/10">
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No features configured</h3>
            <p className="text-muted-foreground">
              Contact your administrator to set up your access permissions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}