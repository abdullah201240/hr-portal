'use client';

import React from 'react';
import { User, Clock, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface DailyAttendanceTableProps {
    loading: boolean;
    data: any[];
}

export const DailyAttendanceTable: React.FC<DailyAttendanceTableProps> = ({ loading, data }) => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 md:h-64">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                    Loading attendance data...
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 md:h-64 text-muted-foreground">
                No attendance records found for this date.
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3">
                {data.map((record) => (
                    <div
                        key={record.emp_id || record.id}
                        className="glass border border-white/10 rounded-lg p-3 space-y-3 hover:bg-white/5 transition-colors"
                    >
                        {/* Header: Employee Info & Status */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                    <User className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">{record.employee_name}</div>
                                    <div className="text-xs text-muted-foreground">{record.employeeId}</div>
                                </div>
                            </div>
                            <Badge variant="outline" className={`${getStatusColor(record.status || 'Absent')} shrink-0 text-xs`}>
                                {record.status?.replace('-', ' ') || 'Absent'}
                            </Badge>
                        </div>

                        {/* Department & Designation */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{record.department || '-'}</span>
                            {record.designation && (
                                <>
                                    <span>•</span>
                                    <span className="truncate">{record.designation}</span>
                                </>
                            )}
                        </div>

                        {/* Clock In/Out & Late/OT */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Clock In</div>
                                <div className="flex items-center gap-1 text-xs font-mono">
                                    {record.clock_in ? (
                                        <>
                                            <Clock className="h-3 w-3 opacity-50" />
                                            {record.clock_in}
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Clock Out</div>
                                <div className="flex items-center gap-1 text-xs font-mono">
                                    {record.clock_out ? (
                                        <>
                                            <Clock className="h-3 w-3 opacity-50" />
                                            {record.clock_out}
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Late/Overtime Info */}
                        {(record.late_minutes > 0 || record.overtime_minutes > 0) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                {record.late_minutes > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                                        <Clock className="h-3 w-3" />
                                        <span>Late: {record.late_minutes}m</span>
                                    </div>
                                )}
                                {record.overtime_minutes > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                                        <Clock className="h-3 w-3" />
                                        <span>OT: {record.overtime_minutes}m</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                            <div className="text-xs text-muted-foreground bg-white/5 p-2 rounded border border-white/5">
                                {record.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full">
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
                        {data.map((record) => (
                            <TableRow key={record.emp_id || record.id} className="hover:bg-white/5 border-white/5">
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};
