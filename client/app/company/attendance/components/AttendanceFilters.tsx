'use client';

import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader } from '@/components/ui/card';

interface AttendanceFiltersProps {
    viewMode: 'daily' | 'monthly';
    date: string;
    setDate: (date: string) => void;
    currentMonth: Date;
    prevMonth: () => void;
    nextMonth: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedEmployee: number | null;
    setSelectedEmployee: (id: number | null) => void;
    employees: any[];
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    viewMode,
    date,
    setDate,
    currentMonth,
    prevMonth,
    nextMonth,
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    employees
}) => {
    return (
        <CardHeader className="pb-3 md:pb-4 px-3 sm:px-4 md:px-6">
            <div className="flex flex-col gap-3 md:gap-4">
                {/* Main Filters Row */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                    {viewMode === 'daily' ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-9 glass border-white/10 w-full h-10"
                                />
                            </div>
                            <div className="relative w-full sm:flex-1 lg:max-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    placeholder="Search name, ID or dept..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 glass border-white/10 w-full h-10"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 p-1 rounded-lg border border-white/10 w-full sm:w-auto">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-white/10 shrink-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-bold min-w-[120px] text-center">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-white/10 shrink-0">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <select
                                value={selectedEmployee || ''}
                                onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                                className="px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-sm h-10 focus:ring-1 focus:ring-emerald-500/50 outline-none w-full sm:flex-1 lg:max-w-[250px]"
                            >
                                <option value="" className="bg-zinc-900">All Employees</option>
                                {employees.map((emp) => (
                                    <option key={emp.emp_id || emp.id} value={emp.emp_id || emp.id} className="bg-zinc-900">
                                        {emp.employee_name}
                                    </option>
                                ))}
                            </select>
                            <div className="relative w-full sm:flex-1 lg:max-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    placeholder="Search name, ID or dept..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 glass border-white/10 w-full h-10"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend Row */}
                <div className="flex flex-wrap gap-2 md:gap-3 text-[10px] md:text-[11px] font-medium text-muted-foreground items-center bg-white/5 p-2 rounded-lg border border-white/10 justify-center sm:justify-start">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Holiday</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Leave</span>
                </div>
            </div>
        </CardHeader>
    );
};
