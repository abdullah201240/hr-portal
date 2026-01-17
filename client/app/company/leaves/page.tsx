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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CompanyLeavePage() {
    const { companyProfile, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [leaveData, setLeaveData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !companyProfile) {
            router.push('/login/company');
        }
    }, [companyProfile, authLoading, router]);

    useEffect(() => {
        if (companyProfile) {
            fetchLeaves();
        }
    }, [companyProfile]);

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

    if (authLoading) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Leave Requests
                    </h1>
                    <p className="text-muted-foreground">Manage and view all employee leave applications.</p>
                </div>
            </div>

            <Card className="glass border-none shadow-none rounded-none">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employee, ID or leave type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 glass border-white/10"
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="glass border-white/10">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter Status: <span className="ml-1 capitalize">{statusFilter}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="glass">
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
                                <span className="text-xs text-muted-foreground">Pending Requests</span>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold text-emerald-500">{leaveData.filter(l => l.status === 'approved').length}</span>
                                <span className="text-xs text-muted-foreground">Approved This Year</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-purple-400">Employee</TableHead>
                                    <TableHead className="text-purple-400">Leave Type</TableHead>
                                    <TableHead className="text-purple-400">Duration</TableHead>
                                    <TableHead className="text-purple-400">Dates</TableHead>
                                    <TableHead className="text-purple-400">Reason</TableHead>
                                    <TableHead className="text-purple-400">Status</TableHead>
                                    <TableHead className="text-purple-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-r-transparent"></div>
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
                                        <TableRow key={record.id} className="hover:bg-white/5 border-white/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                        <User className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{record.employee_name}</div>
                                                        <div className="text-xs text-muted-foreground">{record.employeeId}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{record.leave_type}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono">{record.days} Days</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-muted-foreground">From:</span>
                                                        <span>{new Date(record.start_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-muted-foreground">To:</span>
                                                        <span>{new Date(record.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="truncate text-sm text-muted-foreground" title={record.reason}>
                                                    {record.reason || '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(record.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {record.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                            onClick={() => handleStatusUpdate(record.id, 'approved')}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-600"
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
        </div>
    );
}
