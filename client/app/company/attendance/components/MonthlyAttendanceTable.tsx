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

    const filteredEmployees = selectedEmployee
        ? monthlyAttendanceData.filter(emp => (emp.emp_id || emp.id) === selectedEmployee)
        : monthlyAttendanceData;

    return (
        <div className="w-full">
            {/* Scrollable Container with proper scroll */}
            <div className="w-full overflow-x-auto overflow-y-auto border border-white/10 rounded-lg" style={{ maxHeight: '70vh' }}>
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-zinc-900/95 backdrop-blur-md sticky top-0 z-30">
                            <tr>
                                {/* Employee Column - Sticky Left */}
                                <th className="sticky left-0 z-40 bg-zinc-900 text-emerald-500 px-4 py-3 text-left text-sm font-semibold border-b border-r border-white/20 whitespace-nowrap min-w-[180px]">
                                    Employee
                                </th>
                                
                                {/* ID Column - Sticky Left */}
                                <th className="sticky left-[180px] z-40 bg-zinc-900 text-emerald-500 px-4 py-3 text-left text-sm font-semibold border-b border-r-2 border-white/30 whitespace-nowrap min-w-[80px] shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                                    ID
                                </th>
                                
                                {/* Date Columns - Scrollable */}
                                {monthlyMeta?.dates ? monthlyMeta.dates.map((meta: any) => (
                                    <th key={meta.date} className={`px-2 py-3 text-center border-b border-white/10 min-w-[60px] ${meta.isWeekend || meta.holiday ? 'bg-rose-500/10' : ''}`}>
                                        <div className={`text-[9px] uppercase font-bold tracking-wide mb-1 ${meta.isWeekend || meta.holiday ? 'text-rose-400' : 'text-emerald-500/70'}`}>
                                            {meta.dayOfWeek.substring(0, 3)}
                                        </div>
                                        <div className={`text-sm font-black ${meta.isWeekend || meta.holiday ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {meta.day}
                                        </div>
                                        {meta.holiday && (
                                            <div className="text-[7px] text-rose-400/70 truncate px-1 mt-1" title={meta.holiday}>
                                                {meta.holiday}
                                            </div>
                                        )}
                                    </th>
                                )) : Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                                    const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
                                    
                                    return (
                                        <th key={day} className={`px-2 py-3 text-center border-b border-white/10 min-w-[60px] ${isWeekend ? 'bg-rose-500/10' : ''}`}>
                                            <div className={`text-[9px] uppercase font-bold tracking-wide mb-1 ${isWeekend ? 'text-rose-400' : 'text-emerald-500/70'}`}>
                                                {dayOfWeek}
                                            </div>
                                            <div className={`text-sm font-black ${isWeekend ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {day}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-zinc-950/50 divide-y divide-white/5">
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={100} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No attendance data available for this month.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee, empIndex) => (
                                    <tr
                                        key={employee.emp_id || employee.id}
                                        className={`hover:bg-white/5 transition-colors ${empIndex % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                                    >
                                        {/* Employee Name Cell - Sticky */}
                                        <td className="sticky left-0 z-30 bg-zinc-950 px-4 py-3 font-medium border-b border-r border-white/10 hover:bg-zinc-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                                    <User className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <span className="text-sm text-white truncate max-w-[120px]">
                                                    {employee.employee_name}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* Employee ID Cell - Sticky */}
                                        <td className="sticky left-[180px] z-30 bg-zinc-950 px-4 py-3 text-xs text-gray-400 border-b border-r-2 border-white/20 hover:bg-zinc-900 transition-colors shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                                            {employee.employeeId}
                                        </td>
                                        
                                        {/* Attendance Status Cells - Scrollable */}
                                        {monthlyMeta?.dates ? monthlyMeta.dates.map((meta: any) => {
                                            const dateStr = meta.date;
                                            const dayData = employee.attendance_data?.[dateStr];

                                            const statusClass = getStatusBackgroundColor(dayData?.status || 'scheduled');
                                            const textColor = dayData?.status?.toLowerCase() === 'present' ? 'text-emerald-400' :
                                                dayData?.status?.toLowerCase() === 'absent' ? 'text-rose-400' :
                                                    dayData?.status?.toLowerCase() === 'late' ? 'text-amber-400' :
                                                        dayData?.status?.toLowerCase() === 'on-leave' ? 'text-indigo-400' :
                                                            dayData?.status?.toLowerCase() === 'holiday' ? 'text-slate-400' :
                                                                'text-gray-500';

                                            return (
                                                <td key={dateStr} className={`px-2 py-3 text-center border-b border-white/5 ${meta.isWeekend || meta.holiday ? 'bg-rose-500/5' : ''}`}>
                                                    <div
                                                        className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${statusClass} ${textColor} transition-all hover:scale-125 cursor-pointer shadow-lg`}
                                                        title={`${dayData?.status || 'Scheduled'}${dayData?.notes ? ': ' + dayData.notes : ''}`}
                                                    >
                                                        {dayData?.status === 'on-leave' ? 'L' :
                                                            dayData?.status === 'holiday' ? 'H' :
                                                                dayData?.status === 'present' ? 'P' :
                                                                    dayData?.status === 'absent' ? 'A' :
                                                                        dayData?.status === 'late' ? 'LT' :
                                                                            dayData?.status === 'half-day' ? 'HD' :
                                                                                dayData?.status === 'scheduled' ? '-' : 
                                                                                    dayData?.status?.charAt(0).toUpperCase() || '-'}
                                                    </div>
                                                </td>
                                            );
                                        }) : Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const dayData = employee.attendance_data?.[dateStr];
                                            const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;

                                            if (!dayData) {
                                                return (
                                                    <td key={day} className={`px-2 py-3 text-center border-b border-white/5 ${isWeekend ? 'bg-rose-500/5' : ''}`}>
                                                        <div className="h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs opacity-20 bg-slate-500/10 border border-white/5">
                                                            -
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            const statusClass = getStatusBackgroundColor(dayData.status);
                                            const textColor = dayData.status?.toLowerCase() === 'present' ? 'text-emerald-400' :
                                                dayData.status?.toLowerCase() === 'absent' ? 'text-rose-400' :
                                                    dayData.status?.toLowerCase() === 'late' ? 'text-amber-400' :
                                                        dayData.status?.toLowerCase() === 'on-leave' ? 'text-indigo-400' :
                                                            dayData.status?.toLowerCase() === 'holiday' ? 'text-slate-400' :
                                                                'text-gray-500';

                                            return (
                                                <td key={day} className={`px-2 py-3 text-center border-b border-white/5 ${isWeekend ? 'bg-rose-500/5' : ''}`}>
                                                    <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${statusClass} ${textColor} transition-all hover:scale-125 cursor-pointer shadow-lg`}
                                                        title={`${dayData.status}${dayData.notes ? ': ' + dayData.notes : ''}`}>
                                                        {dayData.status === 'on-leave' ? 'L' :
                                                            dayData.status === 'holiday' ? 'H' :
                                                                dayData.status === 'present' ? 'P' :
                                                                    dayData.status === 'absent' ? 'A' :
                                                                        dayData.status === 'late' ? 'LT' :
                                                                            dayData.status === 'half-day' ? 'HD' :
                                                                                dayData.status?.charAt(0).toUpperCase()}
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

            {/* Scroll Instruction */}
            <div className="text-center py-3 text-xs text-gray-500 border-t border-white/10 bg-zinc-900/50 rounded-b-lg">
                <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Scroll horizontally to view all dates
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </span>
            </div>
        </div>
    );
};