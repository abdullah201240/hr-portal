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

export default function EmployeeDashboard() {
  const { employeeProfile } = useEmployeeAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Present Days', value: '18', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Leave Taken', value: '2', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Tasks', value: '5', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Performance', value: '94%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {employeeProfile?.name || 'Employee'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your profile today.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
          <Clock className="h-5 w-5 text-indigo-500" />
          <div className="text-right">
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm bg-card hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-6 relative">
                <div className={stat.bg + " absolute -right-4 -top-4 w-20 h-20 rounded-full transition-transform group-hover:scale-110 opacity-50"} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className={stat.bg + " p-3 rounded-xl"}>
                    <stat.icon className={"h-6 w-6 " + stat.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Action Card */}
        <Card className="lg:col-span-1 border-indigo-500/10 shadow-lg shadow-indigo-500/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white pb-8">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Attendance
            </CardTitle>
            <CardDescription className="text-indigo-100">Quick clock-in/out for today</CardDescription>
          </CardHeader>
          <CardContent className="p-6 -mt-6">
            <div className="bg-card rounded-2xl shadow-xl p-6 border space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1">
                  Status: Not Clocked In
                </Badge>
                <div className="flex justify-center items-center gap-2 py-4">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium">System ready</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full h-24 flex flex-col gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Coffee className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold">Clock In</span>
                </Button>
                <Button variant="outline" disabled className="w-full h-24 flex flex-col gap-2 rounded-2xl transition-all opacity-50 cursor-not-allowed">
                  <div className="p-2 bg-muted rounded-lg">
                    <LogOut className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="font-bold text-muted-foreground">Clock Out</span>
                </Button>
              </div>

              <div className="pt-4 border-t border-dashed space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift Starts:</span>
                  <span className="font-semibold">09:00 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift Ends:</span>
                  <span className="font-semibold">06:00 PM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest log actions and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-t mt-4">
              {[
                { type: 'Clock In', time: 'Yesterday, 09:02 AM', status: 'On Time', icon: Timer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { type: 'Clock Out', time: 'Yesterday, 06:15 PM', status: 'Overtime', icon: LogOut, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { type: 'Task Completed', time: '2 days ago', status: 'HR-204', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { type: 'Clock In', time: '2 days ago, 08:55 AM', status: 'Early', icon: Timer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-indigo-500/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={activity.bg + " p-2 rounded-lg transition-transform group-hover:scale-110"}>
                      <activity.icon className={"h-5 w-5 " + activity.color} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">{activity.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {employeeProfile?.name?.charAt(0) || 'E'}
            </div>
            <div>
              <CardTitle>{employeeProfile?.name || 'Employee'}</CardTitle>
              <CardDescription>{employeeProfile?.designation || 'Staff Member'}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Employee ID</p>
                <p className="text-sm font-bold">EMP-2024-001</p>
              </div>
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Department</p>
                <p className="text-sm font-bold">{employeeProfile?.department || 'Operations'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">Full Time</Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">Regular</Badge>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">Level 2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { name: 'Apply Leave', icon: Calendar, color: 'text-amber-500' },
              { name: 'Payslip', icon: FileText, color: 'text-emerald-500' },
              { name: 'My Team', icon: User, color: 'text-blue-500' },
              { name: 'Company Policy', icon: Briefcase, color: 'text-purple-500' },
            ].map((link, i) => (
              <Button key={i} variant="outline" className="h-auto py-4 flex flex-col gap-2 rounded-2xl hover:bg-indigo-500/5 border-indigo-500/10 transition-all hover:border-indigo-500/30 group">
                <link.icon className={"h-6 w-6 " + link.color + " group-hover:scale-110 transition-transform"} />
                <span className="text-xs font-bold">{link.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
