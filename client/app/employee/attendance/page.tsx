'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Filter, 
  Download,
  Timer,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { attendanceApi, holidayApi, policyApi } from '@/lib/api';
import { toast } from 'sonner';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';

export default function AttendancePage() {
  const { employeeProfile, isLoading: authLoading } = useEmployeeAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeProfile) {
      fetchData();
    }
  }, [employeeProfile, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();

      const [attendanceRes, holidayRes, policyRes] = await Promise.all([
        attendanceApi.getHistory({ month, year }),
        holidayApi.getHolidays(year),
        policyApi.getAttendancePolicy()
      ]);

      if (attendanceRes.success) setAttendanceData(attendanceRes.data);
      if (holidayRes.success) setHolidays(holidayRes.data);
      if (policyRes.success) setPolicy(policyRes.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Helper to get day data
  const getDayData = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceData.find(r => r.date === dateStr);
    const holiday = holidays.find(h => h.date === dateStr);
    
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeeklyOff = policy?.weekly_holidays?.includes(dayName);

    return { record, holiday, isWeeklyOff, dateStr };
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'late': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case 'absent': return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case 'holiday': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'weekly off': return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default: return "bg-slate-500/5 text-slate-400 border-slate-500/10";
    }
  };

  if (authLoading) return null;

  // Calculate Stats
  const presentCount = attendanceData.filter(r => r.status?.toLowerCase() === 'present' || r.status?.toLowerCase() === 'late').length;
  const lateCount = attendanceData.filter(r => r.status?.toLowerCase() === 'late').length;
  const onTimePercent = presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 100) : 0;
  
  const totalOvertimeMinutes = attendanceData.reduce((acc, r) => acc + (r.overtime_minutes || 0), 0);
  const overtimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  // Define stat cards with dashboard-style design
  const statCards = [
    { 
      title: 'Days Present', 
      value: presentCount.toString(), 
      icon: LogIn, 
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
      title: 'On Time Arrival', 
      value: `${onTimePercent}%`, 
      icon: Timer, 
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
      title: 'Total Overtime', 
      value: `${overtimeHours}h`, 
      icon: Clock, 
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
    { 
      title: 'Late Arrivals', 
      value: lateCount.toString(), 
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
  ];

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily logs and working hours.</p>
        </div>
        
      </div>

      {/* Summary Cards - Updated to match dashboard style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Calendar View */}
        <Card className="lg:col-span-2 border-none shadow-sm glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              Attendance Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold min-w-[120px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-indigo-500/10 rounded-xl overflow-hidden border border-indigo-500/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-indigo-500/5 p-3 text-center text-xs font-bold text-muted-foreground uppercase">
                  {day}
                </div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const { record, holiday, isWeeklyOff } = getDayData(day);
                
                let statusColor = "bg-card";
                if (record) {
                  if (record.status?.toLowerCase() === 'late') statusColor = "bg-amber-500/5";
                  else statusColor = "bg-emerald-500/5";
                } else if (holiday || isWeeklyOff) {
                  statusColor = "bg-slate-500/5";
                }

                return (
                  <div key={i} className={`${statusColor} min-h-[80px] p-2 transition-colors hover:bg-indigo-500/5 relative group`}>
                    <span className="text-xs font-bold text-muted-foreground">{day}</span>
                    <div className="mt-2 flex flex-col gap-1">
                      {holiday ? (
                        <span className="text-[8px] leading-tight text-blue-500 font-medium line-clamp-2">{holiday.name}</span>
                      ) : isWeeklyOff ? (
                        <span className="text-[8px] text-slate-400 font-medium italic">Weekly Off</span>
                      ) : record ? (
                        <>
                          <div className="h-1 w-full bg-emerald-400 rounded-full" />
                          <span className="text-[9px] font-medium text-muted-foreground">{record.clock_in?.substring(0, 5)} - {record.clock_out?.substring(0, 5) || '--:--'}</span>
                          {record.status?.toLowerCase() === 'late' && (
                            <span className="text-[8px] text-amber-500 font-bold">LATE</span>
                          )}
                        </>
                      ) : (
                        new Date() > new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1) && (
                          <div className="h-1 w-full bg-rose-400 rounded-full" />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Logs */}
        <Card className="border-none shadow-sm flex flex-col glass">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Recent Logs
            </CardTitle>
            <CardDescription>Records for this month</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[500px]">
            <div className="divide-y divide-white/5">
              {attendanceData.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No records found for this period.</div>
              ) : (
                [...attendanceData].reverse().map((log, i) => (
                  <div key={i} className="p-4 hover:bg-indigo-500/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-bold">{new Date(log.date).toLocaleDateString([], { day: 'numeric', month: 'short', weekday: 'short' })}</div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] py-0",
                        getStatusBadge(log.status)
                      )}>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">In</p>
                        <p className="text-xs font-bold">{log.clock_in || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Out</p>
                        <p className="text-xs font-bold">{log.clock_out || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Stats</p>
                        <div className="text-[10px]">
                           {log.late_minutes > 0 && <span className="text-amber-500 block">Late: {log.late_minutes}m</span>}
                           {log.overtime_minutes > 0 && <span className="text-indigo-500 block">OT: {log.overtime_minutes}m</span>}
                           {!log.late_minutes && !log.overtime_minutes && <span className="text-muted-foreground">-</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
