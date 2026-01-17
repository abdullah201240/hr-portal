'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { attendanceApi } from '@/lib/api';
import { Card, CardContent, CardHeader} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Calendar as CalendarIcon,
    Download,
    Filter,
    Search,
    Clock,
    User,
    Building2,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Users,
    UserCheck,
    UserX,
    UserMinus,
    TrendingUp,
    LogOut,
    LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CompanyAttendancePage() {
    const { companyProfile, isAuthenticated, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthlyAttendanceData, setMonthlyAttendanceData] = useState<any[]>([]);
    const [monthlyMeta, setMonthlyMeta] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate statistics
    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter(r => r.status?.toLowerCase() === 'present' || r.status?.toLowerCase() === 'late').length,
        late: attendanceData.filter(r => r.status?.toLowerCase() === 'late').length,
        absent: attendanceData.filter(r => r.status?.toLowerCase() === 'absent').length,
        onLeave: attendanceData.filter(r => r.status?.toLowerCase() === 'on-leave').length,
        holidays: attendanceData.filter(r => r.status?.toLowerCase() === 'holiday').length,
    };

    const statCards = [
        { 
            title: 'Total Employees', 
            value: stats.total.toString(), 
            icon: Users, 
            gradient: 'from-blue-500 to-indigo-500',
            bgGradient: 'from-blue-500/10 to-indigo-500/10',
            colorClass: 'border-blue-500/20 hover:border-blue-500/40',
            bgClass: 'from-blue-400 to-indigo-500',
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'from-blue-500/30 to-indigo-500/30',
            glowColor: 'from-blue-400 to-indigo-500',
            glowBlur: 'blur-3xl',
            pulseColor: 'bg-blue-500/20'
        },
        { 
            title: 'Present Today', 
            value: stats.present.toString(), 
            icon: UserCheck, 
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
            title: 'Late Arrivals', 
            value: stats.late.toString(), 
            icon: Clock, 
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            colorClass: 'border-amber-500/20 hover:border-amber-500/40',
            bgClass: 'from-amber-400 to-orange-500',
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBg: 'from-amber-500/30 to-orange-500/30',
            glowColor: 'from-amber-400 to-orange-500',
            glowBlur: 'blur-3xl',
            pulseColor: 'bg-amber-500/20'
        },
        { 
            title: 'Absent / On Leave', 
            value: (stats.absent + stats.onLeave).toString(), 
            icon: UserX, 
            gradient: 'from-rose-500 to-pink-500',
            bgGradient: 'from-rose-500/10 to-pink-500/10',
            colorClass: 'border-rose-500/20 hover:border-rose-500/40',
            bgClass: 'from-rose-400 to-pink-500',
            iconColor: 'text-rose-600 dark:text-rose-400',
            iconBg: 'from-rose-500/30 to-pink-500/30',
            glowColor: 'from-rose-400 to-pink-500',
            glowBlur: 'blur-3xl',
            pulseColor: 'bg-rose-500/20'
        },
    ];

    useEffect(() => {
        // Only redirect if user is explicitly not authenticated
        // Don't redirect if still loading or if token exists but profile is temporarily unavailable
        if (!authLoading && !isAuthenticated) {
            router.push('/login/company');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (authLoading) {
            // While auth is loading, keep loading state as true
            return;
        }
        
        if (isAuthenticated) {
            // Auth is complete and user is authenticated, fetch data
            if (viewMode === 'daily') {
                fetchAttendance();
            } else {
                fetchMonthlyAttendance();
            }
        } else {
            // User is not authenticated, stop loading
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, date, viewMode, currentMonth]);

    const fetchMonthlyAttendance = async () => {
        console.log('Fetching company monthly attendance for month:', currentMonth.getMonth() + 1, 'year:', currentMonth.getFullYear());
        
        try {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            
            const response = await attendanceApi.getCompanyMonthlyAttendance({ month, year });
            console.log('Monthly attendance API response:', response);
            
            if (response.success) {
                setMonthlyAttendanceData(response.data);
                setMonthlyMeta(response.meta);
            } else {
                console.error('Monthly attendance API returned error:', response);
                toast.error(response.message || 'Failed to load monthly attendance data');
            }
        } catch (error) {
            console.error('Error fetching monthly attendance:', error);
            toast.error('Failed to load monthly attendance data');
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

    const fetchAttendance = async () => {
        console.log('Fetching company attendance for date:', date);
        try {
            setLoading(true);
            const response = await attendanceApi.getCompanyAttendance(date);
            console.log('Attendance API response:', response);
            if (response.success) {
                setAttendanceData(response.data);
            } else {
                console.error('Attendance API returned error:', response);
                toast.error(response.message || 'Failed to load attendance data');
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = attendanceData.filter(record =>
        record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'absent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'late': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'half-day': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'holiday': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            case 'on-leave': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'scheduled': return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    // Helper to get status background color for monthly view
    const getStatusBackgroundColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-emerald-500/20';
            case 'absent': return 'bg-rose-500/20';
            case 'late': return 'bg-amber-500/20';
            case 'half-day': return 'bg-blue-500/20';
            case 'holiday': return 'bg-slate-500/20';
            case 'on-leave': return 'bg-indigo-500/20';
            case 'scheduled': return 'bg-slate-500/10';
            default: return 'bg-slate-500/10';
        }
    };

    if (authLoading) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Attendance Overview
                    </h1>
                    <p className="text-muted-foreground">Monitor employee attendance and daily logs.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                        <button 
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1.5 text-sm ${viewMode === 'daily' ? 'bg-emerald-500 text-white' : 'bg-background hover:bg-accent'}`}
                        >
                            Daily
                        </button>
                        <button 
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 py-1.5 text-sm ${viewMode === 'monthly' ? 'bg-emerald-500 text-white' : 'bg-background hover:bg-accent'}`}
                        >
                            Monthly
                        </button>
                    </div>
                    <Button variant="outline" className="glass border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={cn(
                            "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 shadow-lg hover:shadow-2xl glass",
                            card.colorClass
                        )}
                    >
                        {/* Abstract Background Shapes */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150" />
                        <div className={cn("absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-10 blur-3xl", card.glowColor)} />
                        
                        {/* Glow Effect */}
                        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-10 bg-gradient-to-br", card.gradient)} />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={cn("rounded-2xl bg-gradient-to-br p-3 shadow-inner", card.iconBg)}>
                                    <card.icon className={cn("h-6 w-6", card.iconColor)} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        <span>Live Update</span>
                                    </div>
                                    <div className={cn("h-1 w-12 rounded-full mt-1 bg-gradient-to-r", card.bgClass)} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground/80">
                                    {card.title}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn(
                                        "text-4xl font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent",
                                        card.bgClass
                                    )}>
                                        {card.value}
                                    </span>
                                    {card.title.includes('Today') && (
                                        <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                            +2%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Mini-Graph Placeholder */}
                            <div className="flex items-end gap-1 h-8 mt-2 opacity-50">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={cn("flex-1 rounded-t-sm bg-gradient-to-t", card.bgClass)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Pulse Animation Overlay */}
                        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] animate-pulse opacity-50", card.bgClass)} />
                    </motion.div>
                ))}
            </div>

            <Card className="glass border-white/10">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                            {viewMode === 'daily' ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="relative flex-1 md:w-[180px]">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="pl-9 glass border-white/10 w-full"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" onClick={prevMonth}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-bold min-w-[150px] text-center">
                                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <Button variant="outline" size="icon" onClick={nextMonth}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <select 
                                        value={selectedEmployee || ''} 
                                        onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                                        className="px-3 py-2 bg-background border border-input rounded-md text-sm"
                                    >
                                        <option value="">All Employees</option>
                                        {(() => {
                                            const data = (viewMode as string) === 'daily' ? attendanceData : monthlyAttendanceData;
                                            return Array.isArray(data) ? data : [];
                                        })().map((emp) => (
                                            <option key={emp.emp_id} value={emp.emp_id}>
                                                {emp.employee_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employee, ID or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 glass border-white/10 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Holiday</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> On Leave</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        {viewMode === 'daily' ? (
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="text-emerald-500">Employee</TableHead>
                                        <TableHead className="text-emerald-500">Department</TableHead>
                                        <TableHead className="text-emerald-500">Status</TableHead>
                                        <TableHead className="text-emerald-500">Clock In</TableHead>
                                        <TableHead className="text-emerald-500">Clock Out</TableHead>
                                        <TableHead className="text-emerald-500">Late/Overtime</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                                                    Loading attendance data...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No attendance records found for this date.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((record) => (
                                            <TableRow key={record.emp_id} className="hover:bg-white/5 border-white/5">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                            <User className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{record.employee_name}</div>
                                                            <div className="text-xs text-muted-foreground">{record.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{record.department || '-'}</span>
                                                        <span className="text-xs text-muted-foreground">{record.designation || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(record.status || 'Absent')}>
                                                        {record.status?.replace('-', ' ') || 'Absent'}
                                                    </Badge>
                                                    {record.notes && (
                                                        <div className="text-[10px] text-muted-foreground mt-1 px-1">
                                                            {record.notes}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {record.clock_in ? (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 opacity-50" />
                                                            {record.clock_in}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {record.clock_out ? (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 opacity-50" />
                                                            {record.clock_out}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs space-y-1">
                                                        {record.late_minutes > 0 && (
                                                            <div className="text-amber-500 flex items-center gap-1">
                                                                <span>Late: {record.late_minutes}m</span>
                                                            </div>
                                                        )}
                                                        {record.overtime_minutes > 0 && (
                                                            <div className="text-blue-500 flex items-center gap-1">
                                                                <span>OT: {record.overtime_minutes}m</span>
                                                            </div>
                                                        )}
                                                        {record.late_minutes === 0 && record.overtime_minutes === 0 && (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            /* Monthly attendance view */
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 sticky top-0">
                                        <tr>
                                            <th className="text-emerald-500 p-3 text-left min-w-[200px] sticky left-0 bg-[#0a0a0a] z-10">Employee</th>
                                            <th className="text-emerald-500 p-3 text-left min-w-[100px] sticky left-[200px] bg-[#0a0a0a] z-10 border-r border-white/10">ID</th>
                                            {monthlyMeta?.dates ? monthlyMeta.dates.map((meta: any) => (
                                                <th key={meta.date} className={`p-1 text-center min-w-[60px] ${meta.isWeekend || meta.holiday ? 'bg-rose-500/5' : ''}`}>
                                                    <div className={`text-[10px] ${meta.isWeekend || meta.holiday ? 'text-rose-400' : 'text-emerald-500/70'}`}>{meta.dayOfWeek.substring(0, 3)}</div>
                                                    <div className={`text-sm font-bold ${meta.isWeekend || meta.holiday ? 'text-rose-500' : 'text-emerald-500'}`}>{meta.day}</div>
                                                    {meta.holiday && <div className="text-[8px] text-rose-400/70 truncate px-1" title={meta.holiday}>{meta.holiday}</div>}
                                                </th>
                                            )) : Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                const day = i + 1;
                                                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                                                return (
                                                    <th key={day} className="text-emerald-500 p-1 text-center min-w-[60px]">
                                                        <div className="text-xs">{dayOfWeek}</div>
                                                        <div className="text-sm font-bold">{day}</div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedEmployee 
                                            ? monthlyAttendanceData.filter(emp => emp.emp_id === selectedEmployee)
                                            : monthlyAttendanceData
                                        ).map((employee, empIndex) => (
                                            <tr 
                                                key={employee.emp_id} 
                                                className={`hover:bg-white/5 border-white/5 ${(empIndex % 2 === 0) ? 'bg-white/2' : ''}`}
                                            >
                                                <td className="p-3 font-medium sticky left-0 bg-[#0a0a0a] z-10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                            <User className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                        <span className="truncate max-w-[150px]">{employee.employee_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground sticky left-[200px] bg-[#0a0a0a] z-10 border-r border-white/10">{employee.employeeId}</td>
                                                {monthlyMeta?.dates ? monthlyMeta.dates.map((meta: any) => {
                                                    const dateStr = meta.date;
                                                    const dayData = employee.attendance_data[dateStr];
                                                    
                                                    const statusClass = getStatusBackgroundColor(dayData?.status || 'scheduled');
                                                    const textColor = dayData?.status?.toLowerCase() === 'present' ? 'text-emerald-400' : 
                                                                      dayData?.status?.toLowerCase() === 'absent' ? 'text-rose-400' : 
                                                                      dayData?.status?.toLowerCase() === 'late' ? 'text-amber-400' : 
                                                                      dayData?.status?.toLowerCase() === 'on-leave' ? 'text-indigo-400' : 
                                                                      dayData?.status?.toLowerCase() === 'holiday' ? 'text-slate-400' : 
                                                                      'text-gray-500';
                                                    
                                                    return (
                                                        <td key={dateStr} className={`p-1 text-center ${meta.isWeekend || meta.holiday ? 'bg-rose-500/5' : ''}`}>
                                                            <div 
                                                                className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold border ${statusClass} ${textColor} transition-all hover:scale-110 cursor-default`}
                                                                title={`${dayData?.status || 'Scheduled'}${dayData?.notes ? ': ' + dayData.notes : ''}`}
                                                            >
                                                                {dayData?.status === 'on-leave' ? 'L' : 
                                                                 dayData?.status === 'holiday' ? 'H' : 
                                                                 dayData?.status === 'present' ? 'P' : 
                                                                 dayData?.status === 'absent' ? 'A' : 
                                                                 dayData?.status === 'late' ? 'LT' : 
                                                                 dayData?.status === 'scheduled' ? '-' : dayData?.status?.charAt(0).toUpperCase()}
                                                            </div>
                                                            {dayData?.clock_in && (
                                                                <div className="text-[7px] text-center mt-0.5 opacity-70">
                                                                    {dayData.clock_in?.substring(0, 5)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                }) : Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                    const day = i + 1;
                                                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                    const dayData = employee.attendance_data[dateStr];
                                                    
                                                    if (!dayData) {
                                                        return (
                                                            <td key={day} className="p-1 text-center">
                                                                <div className="h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs">
                                                                    -
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    
                                                    const statusClass = getStatusBackgroundColor(dayData.status);
                                                    const textColor = dayData.status?.toLowerCase() === 'present' ? 'text-emerald-700' : 
                                                                      dayData.status?.toLowerCase() === 'absent' ? 'text-rose-700' : 
                                                                      dayData.status?.toLowerCase() === 'late' ? 'text-amber-700' : 
                                                                      dayData.status?.toLowerCase() === 'on-leave' ? 'text-indigo-700' : 
                                                                      dayData.status?.toLowerCase() === 'holiday' ? 'text-slate-700' : 
                                                                      'text-gray-700';
                                                    
                                                    return (
                                                        <td key={day} className="p-1 text-center">
                                                            <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${statusClass} ${textColor}`}>
                                                                {dayData.status?.charAt(0).toUpperCase()}
                                                            </div>
                                                            {dayData.clock_in && (
                                                                <div className="text-[8px] text-center mt-0.5">
                                                                    {dayData.clock_in?.substring(0, 5)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
