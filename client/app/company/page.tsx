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
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyDashboard() {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Session expired. Please log in again.');
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For now, we'll use mock data since the API might not be fully implemented for companies
        // In a real implementation, this would call companyApi.getDashboardStats()
        const mockData = {
          success: true,
          data: {
            employees: {
              total: '42',
              active: '38',
              pending: '4'
            },
            jobs: {
              posted: '15',
              filled: '8',
              open: '7'
            },
            applications: {
              received: '128',
              reviewed: '95',
              pending: '33'
            },
            recent_activity: [
              { name: 'John Doe', action: 'applied for position', created_at: new Date().toISOString(), type: 'application' },
              { name: 'Jane Smith', action: 'updated profile', created_at: new Date(Date.now() - 86400000).toISOString(), type: 'profile' },
              { name: 'Mike Johnson', action: 'interview scheduled', created_at: new Date(Date.now() - 172800000).toISOString(), type: 'interview' },
              { name: 'Sarah Williams', action: 'hired', created_at: new Date(Date.now() - 259200000).toISOString(), type: 'hiring' },
            ]
          }
        };
        setDashboardData(mockData.data);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
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
      value: dashboardData?.employees?.total || '0',
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
      title: 'Active Jobs',
      value: dashboardData?.jobs?.open || '0',
      change: '+2',
      changeLabel: 'from last week',
      icon: Building2,
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
      title: 'New Applications',
      value: dashboardData?.applications?.received || '0',
      change: '+18%',
      changeLabel: 'from last month',
      icon: FileText,
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
      title: 'Hired This Month',
      value: '5',
      change: '+2',
      changeLabel: 'from last month',
      icon: DollarSign,
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

  // Map recent activities from real data
  const recentActivities = dashboardData?.recent_activity?.slice(0, 4).map((activity: any, index: number) => ({
    name: activity.name,
    action: activity.action,
    time: new Date(activity.created_at).toLocaleDateString(),
    icon: index % 4 === 0 ? UserPlus : 
           index % 4 === 1 ? FileText : 
           index % 4 === 2 ? Activity : 
           CheckCircle2,
    color: index % 4 === 0 ? 'text-emerald-400' : 
           index % 4 === 1 ? 'text-blue-400' : 
           index % 4 === 2 ? 'text-purple-400' : 
           'text-amber-400'
  })) || [
    { name: 'John Doe', action: 'applied for position', time: '2 hours ago', icon: UserPlus, color: 'text-emerald-400' },
    { name: 'Jane Smith', action: 'updated profile', time: '4 hours ago', icon: FileText, color: 'text-blue-400' },
    { name: 'Mike Johnson', action: 'interview scheduled', time: '6 hours ago', icon: Activity, color: 'text-purple-400' },
    { name: 'Sarah Williams', action: 'hired', time: '8 hours ago', icon: CheckCircle2, color: 'text-amber-400' },
  ];

  const quickActions = [
    { label: 'Manage Employees', icon: Users, href: '/company/employees', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Post New Job', icon: Building2, href: '/company/jobs', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'View Applications', icon: FileText, href: '/company/applications', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Company Settings', icon: Settings, href: '/company/settings', gradient: 'from-amber-500 to-orange-500' },
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
          Company Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your company.</p>
      </motion.div>

      {/* Stats Grid - Updated to match companies page style with color variants */}
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg glass hover:glass-strong transition-all cursor-pointer group"
                  >
                    <div className={`p-2 rounded-lg glass ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none mb-1 group-hover:text-emerald-400 transition-colors">
                        <span className="font-semibold">{activity.name}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto flex-col items-start p-4 glass border-white/10 hover:glass-strong group relative overflow-hidden"
                      onClick={() => router.push(action.href)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} mb-3`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-left">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}