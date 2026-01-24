'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { attendanceApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Sub-components
import { AttendanceStats } from './components/AttendanceStats';
import { AttendanceFilters } from './components/AttendanceFilters';
import { DailyAttendanceTable } from './components/DailyAttendanceTable';
import { MonthlyAttendanceTable } from './components/MonthlyAttendanceTable';

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
        onLeave: attendanceData.filter(r => r.status?.toLowerCase() === 'on-leave' || r.status?.toLowerCase() === 'half-day').length,
    };

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

                // Log the data to verify we're getting full month data
                console.log('Monthly attendance data received:', response.data.length, 'employees');
                if (response.data.length > 0) {
                    console.log('First employee data:', response.data[0]);
                }
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

    if (authLoading) return null;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Attendance Overview
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">Monitor employee attendance and daily logs.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="flex border rounded-lg overflow-hidden w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`flex-1 sm:flex-none px-4 md:px-3 py-2 md:py-1.5 text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-emerald-500 text-white' : 'bg-background hover:bg-accent'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`flex-1 sm:flex-none px-4 md:px-3 py-2 md:py-1.5 text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-emerald-500 text-white' : 'bg-background hover:bg-accent'}`}
                        >
                            Monthly
                        </button>
                    </div>

                </div>
            </div>

            {/* KPI Cards */}
            <AttendanceStats stats={stats} />

            <Card className="glass border-white/10 overflow-hidden">
                <AttendanceFilters
                    viewMode={viewMode}
                    date={date}
                    setDate={setDate}
                    currentMonth={currentMonth}
                    prevMonth={prevMonth}
                    nextMonth={nextMonth}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                    employees={viewMode === 'daily' ? attendanceData : monthlyAttendanceData}
                />

                <CardContent className="p-0">
                    <div
                        className="rounded-lg md:rounded-xl border border-white/10 bg-black/20 w-full overflow-hidden"
                        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}
                    >
                        {viewMode === 'daily' ? (
                            <DailyAttendanceTable
                                loading={loading}
                                data={filteredData}
                            />
                        ) : (
                            <MonthlyAttendanceTable
                                monthlyMeta={monthlyMeta}
                                monthlyAttendanceData={monthlyAttendanceData}
                                selectedEmployee={selectedEmployee}
                                currentMonth={currentMonth}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
