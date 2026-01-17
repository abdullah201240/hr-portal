'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { leaveApi } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Plane,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CompanyLeavePage() {
    const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [leaveData, setLeaveData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/company');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchLeaves();
        }
    }, [isAuthenticated]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await leaveApi.getCompanyLeaves();
            if (response.success) {
                setLeaveData(response.data);
            }
        } catch (error) {
            console.error('Error fetching leaves:', error);
            toast.error('Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        try {
            const response = await leaveApi.updateLeaveStatus(id, status);
            if (response.success) {
                toast.success(`Leave request ${status} successfully`);
                fetchLeaves(); // Refresh the list
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating status');
        }
    };

    const filteredData = leaveData.filter(record => {
        const matchesSearch =
            record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.leave_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Rejected</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
                <div className="relative">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                        Leave Requests
                    </h1>
                    <p className="text-muted-foreground">Manage and view all employee leave applications.</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative w-full md:w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employee, ID or leave type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 h-11 glass border-white/10"
                                    />
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-11 glass border-white/10">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Filter Status: <span className="ml-1 capitalize">{statusFilter}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="glass border-white/10">
                                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold">{leaveData.filter(l => l.status === 'pending').length}</span>
                                    <span className="text-xs text-muted-foreground">Pending</span>
                                </div>
                                <div className="w-px bg-white/10"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold text-emerald-500">{leaveData.filter(l => l.status === 'approved').length}</span>
                                    <span className="text-xs text-muted-foreground">Approved</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-emerald-500/5 border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leave Type</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dates</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                                                    Loading leave data...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                No leave records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                            <User className="h-5 w-5 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{record.employee_name}</div>
                                                            <div className="text-xs text-muted-foreground font-mono uppercase">{record.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <span className="font-medium">{record.leave_type}</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <span className="font-mono text-emerald-500 font-bold">{record.days} Days</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <div className="text-xs space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground">From:</span>
                                                            <span className="font-medium">{new Date(record.start_date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground">To:</span>
                                                            <span className="font-medium">{new Date(record.end_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 max-w-[200px]">
                                                    <p className="truncate text-sm text-muted-foreground" title={record.reason}>
                                                        {record.reason || '-'}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    {getStatusBadge(record.status)}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    {record.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                                                                onClick={() => handleStatusUpdate(record.id, 'approved')}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                                                onClick={() => handleStatusUpdate(record.id, 'rejected')}
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
