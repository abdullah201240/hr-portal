'use client';

import React from 'react';
import { User } from 'lucide-react';

interface MonthlyAttendanceTableProps {
    monthlyMeta: any;
    monthlyAttendanceData: any[];
    selectedEmployee: number | null;
    currentMonth: Date;
}

export const MonthlyAttendanceTable: React.FC<MonthlyAttendanceTableProps> = ({
    monthlyMeta,
    monthlyAttendanceData,
    selectedEmployee,
    currentMonth
}) => {
    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'present') return 'bg-green-500';
        if (s === 'absent') return 'bg-red-500';
        if (s === 'late') return 'bg-yellow-500';
        if (s === 'half-day') return 'bg-blue-500';
        if (s === 'holiday') return 'bg-gray-500';
        if (s === 'on-leave') return 'bg-purple-500';
        return 'bg-gray-400';
    };

    const getStatusText = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'present') return 'P';
        if (s === 'absent') return 'A';
        if (s === 'late') return 'L';
        if (s === 'half-day') return 'H';
        if (s === 'holiday') return 'HO';
        if (s === 'on-leave') return 'LV';
        return '-';
    };

    const filteredEmployees = selectedEmployee
        ? monthlyAttendanceData.filter(emp => (emp.emp_id || emp.id) === selectedEmployee)
        : monthlyAttendanceData;

    // Define type for date metadata
    type DateMeta = {
        date: string;
        day: number;
        dayName: string;
        isWeekend: boolean;
        holiday: string | null;
    };

    // Generate dates for the month based on actual data
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    // If we have monthly meta data, use it to get actual dates in the month
    const dates: DateMeta[] = monthlyMeta?.dates || Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return {
            date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            day,
            dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
            holiday: null
        };
    });

    // Ensure we have proper date metadata by extracting from the first employee if available
    const actualDates = monthlyAttendanceData.length > 0 && monthlyAttendanceData[0].attendance_data
        ? Object.keys(monthlyAttendanceData[0].attendance_data).map(date => {
            const dateObj = new Date(date);
            return {
                date,
                day: dateObj.getDate(),
                dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
                holiday: null
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : dates;

    // Calculate minimum width for the table to ensure horizontal scrolling
    const nameColumnWidth = 200;
    const idColumnWidth = 100;
    const dateColumnMinWidth = 65;
    const totalTableMinWidth = nameColumnWidth + idColumnWidth + (actualDates.length * dateColumnMinWidth);

    return (
        <div
            className="w-full flex flex-col space-y-4 overflow-hidden"
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%' }}
        >
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between gap-4 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] md:text-sm text-emerald-400 font-bold uppercase tracking-wider">
                        Monthly View
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                    <span className="text-emerald-500 text-sm animate-bounce">⬅️</span>
                    <p className="text-[10px] md:text-xs text-emerald-400 font-black uppercase">
                        Swipe or scroll to view {actualDates.length} days
                    </p>
                    <span className="text-emerald-500 text-sm animate-bounce">➡️</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-md border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-300 font-bold">{actualDates.length} Days</span>
                </div>
            </div>

            <div className="relative border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950/50 backdrop-blur-md">
                <div
                    key={`scroll-container-${actualDates.length}`}
                    className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        width: '100%',
                        maxWidth: '100%',
                        display: 'block'
                    }}
                >
                    <table
                        style={{
                            minWidth: `${totalTableMinWidth}px`,
                            width: 'max-content',
                            tableLayout: 'fixed',
                            borderCollapse: 'separate',
                            borderSpacing: 0
                        }}
                    >
                        <thead>
                            <tr className="sticky top-0 z-40">
                                <th style={{
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 50,
                                    backgroundColor: '#09090b', // zinc-950
                                    padding: '16px 16px',
                                    textAlign: 'left',
                                    color: '#10b981',
                                    borderBottom: '2px solid rgba(255,255,255,0.15)',
                                    borderRight: '2px solid rgba(255,255,255,0.15)',
                                    width: `${nameColumnWidth}px`,
                                    minWidth: `${nameColumnWidth}px`,
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Employee Name
                                </th>
                                <th style={{
                                    position: 'sticky',
                                    left: `${nameColumnWidth}px`,
                                    zIndex: 50,
                                    backgroundColor: '#09090b',
                                    padding: '16px 12px',
                                    textAlign: 'left',
                                    color: '#10b981',
                                    borderBottom: '2px solid rgba(255,255,255,0.15)',
                                    borderRight: '2px solid rgba(255,255,255,0.15)',
                                    width: `${idColumnWidth}px`,
                                    minWidth: `${idColumnWidth}px`,
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Emp ID
                                </th>
                                {actualDates.map(d => (
                                    <th key={d.date} style={{
                                        padding: '12px 0',
                                        textAlign: 'center',
                                        borderBottom: '2px solid rgba(255,255,255,0.1)',
                                        width: `${dateColumnMinWidth}px`,
                                        minWidth: `${dateColumnMinWidth}px`,
                                        backgroundColor: d.isWeekend ? 'rgba(244, 63, 94, 0.2)' : '#09090b'
                                    }}>
                                        <div className={`text-[10px] font-black uppercase tracking-tighter mb-0.5 ${d.isWeekend ? 'text-rose-400' : 'text-emerald-500/70'}`}>
                                            {d.dayName}
                                        </div>
                                        <div className={`text-sm font-black leading-none ${d.isWeekend ? 'text-rose-400' : 'text-zinc-100'}`}>
                                            {d.day}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={actualDates.length + 2} className="py-24 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                                        No Data available
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee, idx) => (
                                    <tr key={employee.emp_id || employee.id} className="group hover:bg-white/[0.03] transition-colors">
                                        <td style={{
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 30,
                                            backgroundColor: idx % 2 === 0 ? '#09090b' : '#111114',
                                            padding: '12px 16px',
                                            borderRight: '2px solid rgba(255,255,255,0.15)'
                                        }} className="group-hover:bg-zinc-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner">
                                                    <User className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <span className="text-[12px] font-extrabold text-zinc-100 truncate shadow-2xl">
                                                    {employee.employee_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            position: 'sticky',
                                            left: `${nameColumnWidth}px`,
                                            zIndex: 30,
                                            backgroundColor: idx % 2 === 0 ? '#09090b' : '#111114',
                                            padding: '12px',
                                            borderRight: '2px solid rgba(255,255,255,0.15)',
                                            color: '#71717a',
                                            fontSize: '11px'
                                        }} className="group-hover:bg-zinc-900 transition-colors font-mono font-bold">
                                            {employee.employeeId || '---'}
                                        </td>
                                        {actualDates.map(d => {
                                            const dayData = employee.attendance_data?.[d.date];
                                            const status = dayData?.status || 'scheduled';

                                            return (
                                                <td key={d.date} style={{
                                                    padding: '6px',
                                                    textAlign: 'center',
                                                    backgroundColor: d.isWeekend ? 'rgba(255, 255, 255, 0.015)' : 'transparent'
                                                }}>
                                                    <div
                                                        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-[11px] font-black shadow-md border border-white/5 transition-all hover:scale-110 hover:z-10 hover:shadow-xl active:scale-90 cursor-pointer ${getStatusColor(status)}`}
                                                        title={`${status}${dayData?.notes ? ' - ' + dayData.notes : ''}`}
                                                    >
                                                        {getStatusText(status)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 px-6 rounded-2xl bg-zinc-950/40 border border-white/5 shadow-inner">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Late</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Leave</span>
                </div>
            </div>
        </div>
    );
};