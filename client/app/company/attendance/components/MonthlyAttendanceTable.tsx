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

    // Generate dates for the month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return {
            day,
            date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            isWeekend: date.getDay() === 0 || date.getDay() === 6
        };
    });

    return (
        <div className="w-full">
            <div className="bg-gray-900 p-2 text-center text-sm text-yellow-400 font-semibold">
                ⬅️ Scroll Left & Right to view all {daysInMonth} days ➡️
            </div>
            
            <div className="border border-gray-700 rounded">
                <div style={{ 
                    width: '100%', 
                    overflowX: 'scroll', 
                    overflowY: 'auto',
                    maxHeight: '600px'
                }}>
                    <table style={{ 
                        width: 'max-content',
                        minWidth: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1f2937' }}>
                                <th style={{
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 30,
                                    backgroundColor: '#1f2937',
                                    padding: '12px',
                                    textAlign: 'left',
                                    color: '#10b981',
                                    borderBottom: '1px solid #374151',
                                    borderRight: '2px solid #374151',
                                    minWidth: '180px'
                                }}>
                                    Employee
                                </th>
                                <th style={{
                                    position: 'sticky',
                                    left: '180px',
                                    zIndex: 30,
                                    backgroundColor: '#1f2937',
                                    padding: '12px',
                                    textAlign: 'left',
                                    color: '#10b981',
                                    borderBottom: '1px solid #374151',
                                    borderRight: '2px solid #374151',
                                    minWidth: '100px'
                                }}>
                                    ID
                                </th>
                                {dates.map(d => (
                                    <th key={d.day} style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        borderBottom: '1px solid #374151',
                                        minWidth: '60px',
                                        backgroundColor: d.isWeekend ? '#7f1d1d' : '#1f2937'
                                    }}>
                                        <div style={{ 
                                            fontSize: '11px', 
                                            fontWeight: 600,
                                            color: d.isWeekend ? '#fca5a5' : '#10b981',
                                            marginBottom: '4px'
                                        }}>
                                            {d.dayName}
                                        </div>
                                        <div style={{ 
                                            fontSize: '14px', 
                                            fontWeight: 'bold',
                                            color: d.isWeekend ? '#fca5a5' : '#ffffff'
                                        }}>
                                            {d.day}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={dates.length + 2} style={{ 
                                        padding: '40px', 
                                        textAlign: 'center',
                                        color: '#9ca3af'
                                    }}>
                                        No attendance data available
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee, idx) => (
                                    <tr key={employee.emp_id || employee.id} style={{
                                        backgroundColor: idx % 2 === 0 ? '#111827' : '#000000'
                                    }}>
                                        <td style={{
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 20,
                                            backgroundColor: idx % 2 === 0 ? '#111827' : '#000000',
                                            padding: '12px',
                                            borderBottom: '1px solid #374151',
                                            borderRight: '2px solid #374151'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <User style={{ width: '16px', height: '16px', color: '#10b981' }} />
                                                </div>
                                                <span style={{ color: '#ffffff', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                    {employee.employee_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            position: 'sticky',
                                            left: '180px',
                                            zIndex: 20,
                                            backgroundColor: idx % 2 === 0 ? '#111827' : '#000000',
                                            padding: '12px',
                                            borderBottom: '1px solid #374151',
                                            borderRight: '2px solid #374151',
                                            color: '#9ca3af',
                                            fontSize: '13px'
                                        }}>
                                            {employee.employeeId}
                                        </td>
                                        {dates.map(d => {
                                            const dayData = employee.attendance_data?.[d.date];
                                            const status = dayData?.status || 'scheduled';
                                            
                                            return (
                                                <td key={d.date} style={{
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #374151',
                                                    backgroundColor: d.isWeekend ? 'rgba(127, 29, 29, 0.1)' : 'transparent'
                                                }}>
                                                    <div 
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            margin: '0 auto',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            color: '#ffffff',
                                                            cursor: 'pointer'
                                                        }}
                                                        className={getStatusColor(status)}
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
        </div>
    );
};