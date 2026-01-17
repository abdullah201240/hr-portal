'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { motion } from 'framer-motion';
import { salaryApi } from '@/lib/api';
import { cn } from '@/lib/utils';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { 
    Banknote, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Download, 
    Filter, 
    Loader2, 
    Plus, 
    Search, 
    CheckCircle2, 
    Clock,
    User,
    Coins,
    TrendingUp,
    MoreHorizontal,
    FileText,
    AlertTriangle,
    Info,
    ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function PayrollPage() {
    const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [payrollList, setPayrollList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // State for payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayouts, setSelectedPayouts] = useState<number[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const [selectedPayoutForDetails, setSelectedPayoutForDetails] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/company');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPayroll();
        }
    }, [isAuthenticated, selectedMonth, selectedYear]);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const response = await salaryApi.getPayrollList({
                month: parseInt(selectedMonth),
                year: parseInt(selectedYear)
            });
            if (response.success) {
                setPayrollList(response.data);
            }
        } catch (error) {
            console.error('Error fetching payroll:', error);
            toast.error('Failed to load payroll records');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async (force = false) => {
        try {
            setGenerating(true);
            const response = await salaryApi.generatePayroll({
                month: parseInt(selectedMonth),
                year: parseInt(selectedYear),
                force
            });
            if (response.success) {
                toast.success(response.message);
                setShowGenerateModal(false);
                fetchPayroll();
            } else {
                toast.error(response.message || 'Failed to generate payroll');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error generating payroll');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateStatus = async (ids: number[], status: 'paid' | 'pending') => {
        if (status === 'paid') {
            setSelectedPayouts(ids);
            setShowPaymentModal(true);
            return;
        }

        try {
            const response = await salaryApi.updatePayoutStatus({
                ids,
                status
            });
            if (response.success) {
                toast.success(response.message);
                fetchPayroll();
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const submitPayment = async () => {
        try {
            setSubmittingPayment(true);
            const response = await salaryApi.updatePayoutStatus({
                ids: selectedPayouts,
                status: 'paid',
                payment_date: paymentDate,
                method: paymentMethod
            });
            if (response.success) {
                toast.success(response.message);
                setShowPaymentModal(false);
                setSelectedPayouts([]);
                fetchPayroll();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmittingPayment(false);
        }
    };

    const filteredList = payrollList.filter(p => 
        p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPayroll = filteredList.reduce((acc, p) => acc + parseFloat(p.net_salary), 0);
    const paidCount = filteredList.filter(p => p.status === 'paid').length;
    const pendingCount = filteredList.filter(p => p.status === 'pending').length;

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
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
                        Monthly Payroll
                    </h1>
                    <p className="text-muted-foreground">Process and manage employee monthly salary disbursements.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setShowGenerateModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-11"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Payroll
                    </Button>
                    <Button variant="outline" className="glass border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-11">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Monthly Total', value: `৳${totalPayroll.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Paid Employees', value: paidCount, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending Payment', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="glass border-none shadow-none group overflow-hidden">
                            <CardContent className="p-6 relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon className="h-16 w-16" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 glass border-white/10"
                                />
                            </div>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[150px] h-11 glass border-white/10">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {months.map((m, i) => (
                                        <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[120px] h-11 glass border-white/10">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-emerald-500/5 border-b border-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Salary</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deductions</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Salary</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                                Loading payroll data...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <FileText className="h-8 w-8 opacity-20" />
                                                <p>No payroll generated for this month.</p>
                                                <Button 
                                                    variant="link" 
                                                    className="text-emerald-500"
                                                    onClick={() => setShowGenerateModal(true)}
                                                >
                                                    Generate now
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList.map((payout) => (
                                        <TableRow key={payout.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                        <User className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{payout.employee_name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono uppercase">{payout.employeeId}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 font-mono text-muted-foreground">
                                                ৳{parseFloat(payout.basic_salary).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-mono font-medium",
                                                        parseFloat(payout.deductions) > 0 ? "text-rose-400" : "text-muted-foreground/50"
                                                    )}>
                                                        ৳{parseFloat(payout.deductions).toLocaleString()}
                                                    </span>
                                                    {parseFloat(payout.deductions) > 0 && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-6 w-6 rounded-full hover:bg-rose-500/10 text-rose-400"
                                                            onClick={() => {
                                                                setSelectedPayoutForDetails(payout);
                                                                setShowDetailsModal(true);
                                                            }}
                                                        >
                                                            <Info className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="font-mono font-bold text-emerald-500">
                                                    ৳{parseFloat(payout.net_salary).toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                {payout.status === 'paid' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                        Paid on {new Date(payout.payment_date).toLocaleDateString()}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-500 hover:bg-emerald-500/10"
                                                        onClick={() => router.push(`/company/payroll/${payout.id}`)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Statement
                                                    </Button>
                                                    {payout.status === 'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus([payout.id], 'paid')}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                        >
                                                            Mark as Paid
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="glass sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-500" />
                            Deduction Breakdown
                        </DialogTitle>
                        <DialogDescription>
                            Detailed breakdown for {selectedPayoutForDetails?.employee_name}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Basic Salary</span>
                                <span className="font-mono font-bold text-foreground">৳{parseFloat(selectedPayoutForDetails?.basic_salary || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            
                            {/* Late Deduction */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Late Entry ({selectedPayoutForDetails?.late_count || 0})</span>
                                    </div>
                                    <span className="font-mono text-rose-400">-৳{parseFloat(selectedPayoutForDetails?.late_deduction || 0).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground pl-5">Deduction applied after monthly limit.</p>
                            </div>

                            {/* Unpaid Leave */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Unpaid Leaves ({selectedPayoutForDetails?.unpaid_leave_days || 0} days)</span>
                                    </div>
                                    <span className="font-mono text-rose-400">-৳{parseFloat(selectedPayoutForDetails?.unpaid_leave_deduction || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Absences */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>Absences ({selectedPayoutForDetails?.absent_days || 0} days)</span>
                                    </div>
                                    <span className="font-mono text-rose-400">-৳{parseFloat(selectedPayoutForDetails?.absence_deduction || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-bold text-foreground">Total Net Salary</span>
                                <span className="text-xl font-bold text-emerald-500 font-mono">৳{parseFloat(selectedPayoutForDetails?.net_salary || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" onClick={() => setShowDetailsModal(false)}>Close Breakdown</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate Modal */}
            <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
                <DialogContent className="glass sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Generate Payroll</DialogTitle>
                        <DialogDescription>
                            Create salary records for {months[parseInt(selectedMonth) - 1]} {selectedYear} for all active employees.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Coins className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-foreground font-medium">Auto-Calculation Enabled</p>
                            <p className="text-xs text-muted-foreground px-4">
                                The system will automatically calculate deductions based on:
                                <br />• Exceeded lates (Monthly limit applies)
                                <br />• Absences & Unpaid leaves
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                        {payrollList.length > 0 && (
                            <Button 
                                variant="outline"
                                onClick={() => handleGeneratePayroll(true)} 
                                disabled={generating}
                                className="glass border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                            >
                                {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Recalculate All
                            </Button>
                        )}
                        <Button 
                            onClick={() => handleGeneratePayroll(false)} 
                            disabled={generating}
                            className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        >
                            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {payrollList.length > 0 ? 'Process Missing' : 'Process Payroll'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="glass sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Disburse Payment</DialogTitle>
                        <DialogDescription>
                            Enter payment details for selected employees.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Date</label>
                            <Input 
                                type="date" 
                                value={paymentDate} 
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="glass border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Method</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="glass border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Cheque">Check</SelectItem>
                                    <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                        <Button 
                            onClick={submitPayment} 
                            disabled={submittingPayment}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {submittingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
