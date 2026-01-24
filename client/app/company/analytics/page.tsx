'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  DollarSign,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle2,
  Settings,
  FileText,
  UserPlus,
  BarChart3,
  TrendingUp,
  Calendar,
  Coins
} from 'lucide-react';
import { motion } from 'framer-motion';
import { salaryApi, attendanceApi, employeeApi, companyAnalyticsApi } from '@/lib/api';

export default function CompanyAnalytics() {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Session expired. Please log in again.');
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch company analytics data from the backend
        const statsResponse = await companyAnalyticsApi.getCompanyAnalytics();
        
        setAnalyticsData(statsResponse.data);
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        toast.error(error.message || 'Failed to load analytics data');
        
        // Fallback to mock data if API fails
        const mockData = {
          employees: {
            total: 42,
            active: 38,
            inactive: 4,
            male: 25,
            female: 17,
            averageTenure: 2.5,
            departments: [
              { department: 'Engineering', count: 15 },
              { department: 'Marketing', count: 8 },
              { department: 'Sales', count: 10 },
              { department: 'HR', count: 5 },
              { department: 'Finance', count: 4 }
            ]
          },
          attendance: {
            totalPresent: 1250,
            totalLate: 85,
            totalAbsent: 32,
            attendanceRate: 94.2,
            monthlyTrend: [
              { month: 'Jan 2023', present: 95, late: 12, absent: 3 },
              { month: 'Feb 2023', present: 98, late: 8, absent: 2 },
              { month: 'Mar 2023', present: 92, late: 15, absent: 5 },
              { month: 'Apr 2023', present: 96, late: 10, absent: 4 },
              { month: 'May 2023', present: 97, late: 9, absent: 3 },
              { month: 'Jun 2023', present: 94, late: 11, absent: 3 },
            ]
          },
          salary: {
            totalPayroll: 250000,
            averageSalary: 5800,
            highestPaid: 12000,
            lowestPaid: 3000,
            monthlyTrend: [
              { month: 'January 2023', amount: 245000 },
              { month: 'February 2023', amount: 248000 },
              { month: 'March 2023', amount: 252000 },
              { month: 'April 2023', amount: 249000 },
              { month: 'May 2023', amount: 251000 },
              { month: 'June 2023', amount: 250000 },
            ]
          },
          leaves: {
            recentRequests: 15,
            approved: 12
          },
          productivity: {
            averageRating: 4.2,
            projectsCompleted: 24,
            onTimeRate: 87
          }
        };
        
        setAnalyticsData(mockData);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated]);

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

  // Use real data if available, fallback to mock data
  const statCards = [
    {
      title: 'Total Employees',
      value: analyticsData?.employees?.total || '0',
      change: '+5',
      changeLabel: 'from last month',
      icon: Users,
      trend: 'up',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      colorClass: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgClass: 'from-emerald-400 to-teal-500',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'from-emerald-500/30 to-teal-500/30',
      glowColor: 'from-emerald-400 to-teal-500',
      glowBlur: 'blur-3xl',
      pulseColor: 'bg-emerald-500/20'
    },
    {
      title: 'Avg. Monthly Payroll',
      value: `৳${(analyticsData?.salary?.totalPayroll || 0).toLocaleString()}`,
      change: '+3.2%',
      changeLabel: 'from last month',
      icon: DollarSign,
      trend: 'up',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      colorClass: 'border-blue-500/20 hover:border-blue-500/40',
      bgClass: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'from-blue-500/30 to-cyan-500/30',
      glowColor: 'from-blue-400 to-cyan-500',
      glowBlur: 'blur-3xl',
      pulseColor: 'bg-blue-500/20'
    },
    {
      title: 'Avg. Attendance',
      value: `${analyticsData?.attendance?.attendanceRate || 94.2}%`,
      change: '+2.1%',
      changeLabel: 'from last month',
      icon: Activity,
      trend: 'up',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
      colorClass: 'border-amber-500/20 hover:border-amber-500/40',
      bgClass: 'from-amber-500 to-orange-500',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'from-amber-500/30 to-orange-500/30',
      glowColor: 'from-amber-400 to-orange-500',
      glowBlur: 'blur-3xl',
      pulseColor: 'bg-amber-500/20'
    },
    {
      title: 'Projects Completed',
      value: analyticsData?.productivity?.projectsCompleted || '0',
      change: '+8',
      changeLabel: 'from last quarter',
      icon: CheckCircle2,
      trend: 'up',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      colorClass: 'border-purple-500/20 hover:border-purple-500/40',
      bgClass: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'from-purple-500/30 to-pink-500/30',
      glowColor: 'from-purple-400 to-pink-500',
      glowBlur: 'blur-3xl',
      pulseColor: 'bg-purple-500/20'
    },
  ];

  // Department chart data
  const departmentData = analyticsData?.employees?.departments || [
    { department: 'Engineering', count: 15 },
    { department: 'Marketing', count: 8 },
    { department: 'Sales', count: 10 },
    { department: 'HR', count: 5 },
    { department: 'Finance', count: 4 }
  ];

  // Attendance trend data
  const attendanceTrend = analyticsData?.attendance?.monthlyTrend || [
    { month: 'Jan', present: 95, late: 12, absent: 3 },
    { month: 'Feb', present: 98, late: 8, absent: 2 },
    { month: 'Mar', present: 92, late: 15, absent: 5 },
    { month: 'Apr', present: 96, late: 10, absent: 4 },
    { month: 'May', present: 97, late: 9, absent: 3 },
    { month: 'Jun', present: 94, late: 11, absent: 3 },
  ];

  return (
    <div className="bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Company Analytics
        </h1>
        <p className="text-muted-foreground">Comprehensive insights and analytics for your company.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`relative glass ${stat.colorClass} overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
              {/* 3D Background Graphics with color variants */}
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.glowColor} ${stat.glowBlur} group-hover:scale-150 transition-transform duration-700`} />
                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${stat.glowColor.replace('to-', 'to-')} rounded-full ${stat.glowBlur.replace('blur-', 'blur-2')} group-hover:scale-125 transition-transform duration-700`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${stat.pulseColor} rounded-full blur-xl animate-pulse`} />
              </div>

              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground/70 mb-1.5">{stat.title}</p>
                    <motion.h3
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                      animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      {stat.value}
                    </motion.h3>
                  </div>
                  <motion.div
                    className="relative"
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgClass} rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className={`relative bg-gradient-to-br ${stat.iconBg} p-3 rounded-xl backdrop-blur-sm border border-${stat.iconColor.split('-')[1]}-400/20`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor} drop-shadow-lg`} />
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map((dept: any, index: number) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept.department}</span>
                      <span>{dept.count} employees</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" 
                        style={{ width: `${(dept.count / (analyticsData?.employees?.total || 40)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Monthly Attendance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceTrend.map((month: any, index: number) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-emerald-500">{month.present}% present</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="flex h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full" 
                          style={{ width: `${month.present}%` }}
                        ></div>
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-400" 
                          style={{ width: `${month.late}%` }}
                        ></div>
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-400 rounded-r-full" 
                          style={{ width: `${month.absent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span className="text-emerald-500">P: {month.present}</span>
                        <span className="text-amber-500">L: {month.late}</span>
                        <span className="text-red-500">A: {month.absent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                Employee Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Male</span>
                  <span className="text-sm font-medium">{analyticsData?.employees?.male || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full" 
                    style={{ width: `${((analyticsData?.employees?.male || 0) / (analyticsData?.employees?.total || 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Female</span>
                  <span className="text-sm font-medium">{analyticsData?.employees?.female || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-pink-400 h-2.5 rounded-full" 
                    style={{ width: `${((analyticsData?.employees?.female || 0) / (analyticsData?.employees?.total || 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="pt-2 border-t border-border/30">
                  <div className="flex justify-between text-sm">
                    <span>Avg. Tenure</span>
                    <span className="font-medium">{analyticsData?.employees?.averageTenure || 0} years</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Salary Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-400" />
                Salary Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Average Salary</span>
                  <span className="font-medium">৳{(analyticsData?.salary?.averageSalary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Highest Paid</span>
                  <span className="font-medium">৳{(analyticsData?.salary?.highestPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lowest Paid</span>
                  <span className="font-medium">৳{(analyticsData?.salary?.lowestPaid || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-border/30">
                  <div className="text-sm mb-2">Monthly Payroll Trend</div>
                  <div className="flex items-end h-12 space-x-1">
                    {analyticsData?.salary?.monthlyTrend?.map((month: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                          style={{ height: `${Math.min(100, (month.amount / 300000) * 100)}%` }}
                        ></div>
                        <span className="text-xs mt-1 text-muted-foreground">{month.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Productivity Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Rating</span>
                  <span className="font-medium">{analyticsData?.productivity?.averageRating || 0}/5.0</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" 
                    style={{ width: `${(analyticsData?.productivity?.averageRating || 0) * 20}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">On-time Delivery</span>
                  <span className="font-medium">{analyticsData?.productivity?.onTimeRate || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full" 
                    style={{ width: `${analyticsData?.productivity?.onTimeRate || 0}%` }}
                  ></div>
                </div>
                
                <div className="pt-2 border-t border-border/30">
                  <div className="flex justify-between text-sm">
                    <span>Projects Completed</span>
                    <span className="font-medium">{analyticsData?.productivity?.projectsCompleted || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}