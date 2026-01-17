'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  User,
  Coffee,
  Briefcase,
  History,
  Timer,
  LogOut,
  FileText
} from 'lucide-react';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { motion } from 'framer-motion';
import { attendanceApi, policyApi, leaveApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { employeeProfile } = useEmployeeAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    presentDays: 0,
    leaveTaken: 0,
    pendingApprovals: 0,
    performance: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes, policyRes, leavesRes, pendingRes] = await Promise.all([
        attendanceApi.getStatus(),
        attendanceApi.getHistory({ limit: 30 }), // Get last 30 days for stats
        policyApi.getAttendancePolicy(),
        leaveApi.getMyLeaves(),
        leaveApi.getPendingApprovals()
      ]);

      if (statusRes.success) setAttendance(statusRes.data);
      if (historyRes.success) {
        setHistory(historyRes.data.slice(0, 4)); // Only show last 4 in recent activity
        
        // Calculate Present Days
        const presentDays = historyRes.data.filter((r: any) => 
          r.status?.toLowerCase() === 'present' || r.status?.toLowerCase() === 'late'
        ).length;
        
        // Calculate Performance (On-time percentage)
        const totalLogs = historyRes.data.length;
        const onTimeLogs = historyRes.data.filter((r: any) => r.status?.toLowerCase() === 'present').length;
        const performance = totalLogs > 0 ? Math.round((onTimeLogs / totalLogs) * 100) : 0;

        setDashboardStats(prev => ({ ...prev, presentDays, performance }));
      }
      if (policyRes.success) setPolicy(policyRes.data);
      if (leavesRes.success) {
        const approvedLeaves = leavesRes.data.filter((l: any) => l.status === 'approved').length;
        setDashboardStats(prev => ({ ...prev, leaveTaken: approvedLeaves }));
      }
      if (pendingRes.success) {
        setDashboardStats(prev => ({ ...prev, pendingApprovals: pendingRes.data.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await attendanceApi.getStatus();
      if (response.success) {
        setAttendance(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await attendanceApi.getHistory({ limit: 4 });
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      const response = await attendanceApi.clockIn();
      if (response.success) {
        setAttendance(response.data);
        await fetchDashboardData(); // Refresh all data
        toast.success('Successfully clocked in!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      const response = await attendanceApi.clockOut();
      if (response.success) {
        setAttendance(response.data);
        await fetchDashboardData(); // Refresh all data
        toast.success('Successfully clocked out!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const stats = [
    { 
      title: 'Present Days', 
      value: dashboardStats.presentDays.toString(), 
      icon: CheckCircle2, 
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
      title: 'Leave Taken', 
      value: dashboardStats.leaveTaken.toString(), 
      icon: Calendar, 
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
      title: 'Pending Approvals', 
      value: dashboardStats.pendingApprovals.toString(), 
      icon: AlertCircle, 
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
      title: 'Performance', 
      value: `${dashboardStats.performance}%`, 
      icon: TrendingUp, 
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/10 to-purple-500/10',
      colorClass: 'border-indigo-500/20 hover:border-indigo-500/40',
      bgClass: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'from-indigo-500/30 to-purple-500/30',
      glowColor: 'from-indigo-400 to-purple-500',
      glowBlur: 'blur-3xl',
      pulseColor: 'bg-indigo-500/20'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {employeeProfile?.name || 'Employee'}!
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Here's what's happening with your profile today.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
          <Clock className="h-4 w-4 text-indigo-500" />
          <div className="text-right">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[9px] text-muted-foreground font-medium">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`relative glass ${stat.colorClass} overflow-hidden group hover:shadow-xl transition-all duration-500`}>
              {/* 3D Background Graphics */}
              <div className="absolute inset-0 opacity-20">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.glowColor} ${stat.glowBlur} group-hover:scale-150 transition-transform duration-700`} />
                <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${stat.glowColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 ${stat.pulseColor} rounded-full blur-xl animate-pulse`} />
              </div>

              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</p>
                    <motion.h3
                      className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
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
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgClass} rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity`} />
                    <div className={`relative bg-gradient-to-br ${stat.iconBg} p-2.5 rounded-xl backdrop-blur-sm border border-white/10`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor} drop-shadow-lg`} />
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Action Card */}
        <Card className="lg:col-span-1 border-indigo-500/10 shadow-lg shadow-indigo-500/5 overflow-hidden glass">
          <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white pb-6 pt-4 px-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="h-4 w-4" />
              Attendance
            </CardTitle>
            <CardDescription className="text-indigo-100 text-[10px]">Quick clock-in/out for today</CardDescription>
          </CardHeader>
          <CardContent className="p-4 -mt-4">
            <div className="bg-card/50 backdrop-blur-md rounded-xl shadow-lg p-4 border border-indigo-500/10 space-y-4">
              <div className="text-center space-y-1">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "px-2 py-0 text-[10px]",
                    attendance?.clock_in && !attendance?.clock_out 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  )}
                >
                  Status: {attendance?.clock_in 
                    ? (attendance?.clock_out ? 'Clocked Out' : 'Clocked In') 
                    : 'Not Clocked In'}
                </Badge>
                <div className="flex justify-center items-center gap-1.5 py-2">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    attendance?.clock_in && !attendance?.clock_out ? "bg-emerald-500" : "bg-red-500"
                  )} />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {attendance?.clock_in && !attendance?.clock_out ? 'Working' : 'System ready'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleClockIn}
                  disabled={!!attendance?.clock_in || actionLoading}
                  className="w-full h-20 flex flex-col gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group disabled:opacity-50"
                >
                  <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Coffee className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold">{attendance?.clock_in ? 'Clocked In' : 'Clock In'}</span>
                  {attendance?.clock_in && <span className="text-[8px] opacity-80">{attendance.clock_in.substring(0, 5)}</span>}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClockOut}
                  disabled={!attendance?.clock_in || !!attendance?.clock_out || actionLoading}
                  className="w-full h-20 flex flex-col gap-1 rounded-xl transition-all group border-indigo-500/20 hover:bg-indigo-500/5 disabled:opacity-50"
                >
                  <div className="p-1.5 bg-muted rounded-lg group-hover:scale-110 transition-transform">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {attendance?.clock_out ? 'Clocked Out' : 'Clock Out'}
                  </span>
                  {attendance?.clock_out && <span className="text-[8px] text-muted-foreground opacity-80">{attendance.clock_out.substring(0, 5)}</span>}
                </Button>
              </div>

              <div className="pt-3 border-t border-dashed space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Shift Starts:</span>
                  <span className="font-bold">{policy ? formatTime(policy.office_start_time) : '09:00 AM'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Shift Ends:</span>
                  <span className="font-bold">{policy ? formatTime(policy.office_end_time) : '06:00 PM'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-[10px]">Your latest log actions and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-t mt-2">
              {history.length > 0 ? history.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-indigo-500/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-transform group-hover:scale-110",
                      activity.status === 'present' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    )}>
                      <Timer className={cn(
                        "h-4 w-4",
                        activity.status === 'present' ? 'text-emerald-500' : 'text-amber-500'
                      )} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold leading-none">
                        {activity.clock_out ? 'Full Shift' : 'Clock In'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {activity.clock_in.substring(0, 5)}
                        {activity.clock_out && ` - ${activity.clock_out.substring(0, 5)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 uppercase">
                    {activity.status}
                  </Badge>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No recent attendance activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm overflow-hidden glass">
          <CardHeader className="flex flex-row items-center gap-3 pb-3 pt-4 px-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {employeeProfile?.name?.charAt(0) || 'E'}
            </div>
            <div>
              <CardTitle className="text-base">{employeeProfile?.name || 'Employee'}</CardTitle>
              <CardDescription className="text-[10px]">{employeeProfile?.designation || 'Staff Member'}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10 backdrop-blur-sm">
                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Employee ID</p>
                <p className="text-xs font-bold">{employeeProfile?.employeeId || '---'}</p>
              </div>
              <div className="p-2 bg-purple-500/5 rounded-lg border border-purple-500/10 backdrop-blur-sm">
                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Department</p>
                <p className="text-xs font-bold">{employeeProfile?.department || '---'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] px-1.5 py-0">Full Time</Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] px-1.5 py-0">Regular</Badge>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0">Level 2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 px-4 pb-4">
            {[
              { name: 'Apply Leave', icon: Calendar, color: 'text-amber-500', href: '/employee/leave' },
              { name: 'My Attendance', icon: History, color: 'text-emerald-500', href: '/employee/attendance' },
              { name: 'Leave Approvals', icon: User, color: 'text-blue-500', href: '/employee/leave/approvals' },
              { name: 'Settings', icon: Briefcase, color: 'text-purple-500', href: '/employee/settings' },
            ].map((link, i) => (
              <Button 
                key={i} 
                variant="outline" 
                className="h-auto py-2.5 flex flex-col gap-1 rounded-xl hover:bg-indigo-500/5 border-indigo-500/10 transition-all hover:border-indigo-500/30 group glass"
                onClick={() => link.href !== '#' && router.push(link.href)}
              >
                <link.icon className={"h-4 w-4 " + link.color + " group-hover:scale-110 transition-transform"} />
                <span className="text-[10px] font-bold">{link.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
