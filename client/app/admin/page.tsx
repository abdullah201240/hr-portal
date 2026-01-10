'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Settings,
  FileText,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

const statCards = [
  {
    title: 'Total Companies',
    value: '12',
    change: '+2',
    changeLabel: 'from last month',
    icon: Building2,
    trend: 'up',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    title: 'Active Users',
    value: '8,234',
    change: '+12%',
    changeLabel: 'from last month',
    icon: Users,
    trend: 'up',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    title: 'Pending Approvals',
    value: '3',
    change: '-1',
    changeLabel: 'from last week',
    icon: Clock,
    trend: 'down',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    title: 'Revenue',
    value: '$4,230',
    change: '+18%',
    changeLabel: 'from last month',
    icon: DollarSign,
    trend: 'up',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
  },
];

const recentActivities = [
  { company: 'Acme Inc', action: 'registered', time: '2 hours ago', icon: UserPlus, color: 'text-emerald-400' },
  { company: 'Globex Corp', action: 'updated profile', time: '4 hours ago', icon: FileText, color: 'text-blue-400' },
  { company: 'Stark Industries', action: 'logged in', time: '6 hours ago', icon: Activity, color: 'text-purple-400' },
  { company: 'Wayne Enterprises', action: 'submitted report', time: '8 hours ago', icon: BarChart3, color: 'text-amber-400' },
];

const quickActions = [
  { label: 'Manage Companies', icon: Building2, href: '/admin/companies', gradient: 'from-emerald-500 to-teal-500' },
  { label: 'View Reports', icon: BarChart3, href: '/admin/analytics', gradient: 'from-blue-500 to-cyan-500' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings', gradient: 'from-purple-500 to-pink-500' },
  { label: 'User Management', icon: Users, href: '/admin/users', gradient: 'from-amber-500 to-orange-500' },
];

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Session expired. Please log in again.');
      router.push('/login/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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

  return (
    <div >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass hover-lift border-white/10 overflow-hidden group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center text-xs">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-400 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-400 mr-1" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">{stat.changeLabel}</span>
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
                {recentActivities.map((activity, index) => (
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
                        <span className="font-semibold">{activity.company}</span> {activity.action}
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