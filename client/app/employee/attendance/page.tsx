'use client';

import React, { useState } from 'react';
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
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const attendanceData = [
    { date: '2024-03-20', clockIn: '09:02 AM', clockOut: '06:15 PM', duration: '9h 13m', status: 'Present' },
    { date: '2024-03-19', clockIn: '08:55 AM', clockOut: '06:05 PM', duration: '9h 10m', status: 'Present' },
    { date: '2024-03-18', clockIn: '09:10 AM', clockOut: '06:30 PM', duration: '9h 20m', status: 'Present' },
    { date: '2024-03-17', clockIn: '-', clockOut: '-', duration: '-', status: 'Weekly Off' },
    { date: '2024-03-16', clockIn: '-', clockOut: '-', duration: '-', status: 'Weekly Off' },
    { date: '2024-03-15', clockIn: '09:00 AM', clockOut: '06:00 PM', duration: '9h 00m', status: 'Present' },
    { date: '2024-03-14', clockIn: '09:05 AM', clockOut: '05:30 PM', duration: '8h 25m', status: 'Half Day' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily logs and working hours.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-indigo-500/10 hover:bg-indigo-500/5">
            <Download className="mr-2 h-4 w-4 text-indigo-500" />
            Export Report
          </Button>
          <Button className="rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Average Work Hours', value: '8.5h', icon: Timer, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'On Time Arrival', value: '92%', icon: LogIn, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Total Overtime', value: '12h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Pending Regularization', value: '1', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className={stat.bg + " p-2 rounded-lg group-hover:scale-110 transition-transform"}>
                  <stat.icon className={"h-5 w-5 " + stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Calendar View */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              Attendance Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold min-w-[100px] text-center">March 2024</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
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
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isOff = [3, 4, 10, 11, 17, 18, 24, 25, 31].includes(day);
                const isAbsent = day === 12;
                return (
                  <div key={i} className="bg-card min-h-[80px] p-2 transition-colors hover:bg-indigo-500/5 cursor-pointer relative group">
                    <span className="text-xs font-bold text-muted-foreground">{day}</span>
                    <div className="mt-2 flex flex-col gap-1">
                      {isOff ? (
                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
                      ) : isAbsent ? (
                        <div className="h-1 w-full bg-red-400 rounded-full" />
                      ) : (
                        <div className="h-1 w-full bg-emerald-400 rounded-full" />
                      )}
                      {!isOff && !isAbsent && (
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-indigo-500">09:00 - 18:00</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Logs */}
        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Daily Logs
            </CardTitle>
            <CardDescription>Detailed history for this month</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[500px]">
            <div className="divide-y">
              {attendanceData.map((log, i) => (
                <div key={i} className="p-4 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-bold">{new Date(log.date).toLocaleDateString([], { day: 'numeric', month: 'short', weekday: 'short' })}</div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] py-0",
                      log.status === 'Present' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                      log.status === 'Weekly Off' ? "bg-slate-500/10 text-slate-600 border-slate-500/20" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase">In</p>
                      <p className="text-xs font-bold">{log.clockIn}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase">Out</p>
                      <p className="text-xs font-bold">{log.clockOut}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{log.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t mt-auto">
            <Button variant="ghost" className="w-full text-indigo-500 text-sm font-bold hover:bg-indigo-500/5">
              Load More History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
