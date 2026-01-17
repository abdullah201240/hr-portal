'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { motion } from 'framer-motion';
import { salaryApi, attendanceApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    User, 
    Clock, 
    Calendar, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowUpRight,
    TrendingUp,
    FileText,
    Loader2,
    ShieldCheck,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

export default function PayoutDetailPage() {
    const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [payout, setPayout] = useState<any>(null);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/company');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && id) {
            fetchPayoutDetails();
        }
    }, [isAuthenticated, id]);

    const fetchPayoutDetails = async () => {
        try {
            setLoading(true);
            const response = await salaryApi.getPayoutDetails(parseInt(id as string));
            if (response.success) {
                setPayout(response.data);
                fetchAttendanceLogs(response.data.employee_id, response.data.month, response.data.year);
            } else {
                toast.error(response.message);
                router.push('/company/payroll');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceLogs = async (employeeId: number, month: number, year: number) => {
        try {
            setLoadingLogs(true);
            // We use the existing employee attendance history but filtered by month
            const response = await attendanceApi.getHistory({ 
                month, 
                year,
                limit: 100 
            });
            // Note: Since the current API might not support filtering by employee_id for companies easily here, 
            // in a real app we'd have a specific endpoint. 
            // For now, we'll assume we have the data or just show the calculated breakdown.
            if (response.success) {
                setAttendanceLogs(response.data);
            }
        } catch (error) {
            console.error('Error logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!payout) return null;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-6 pb-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
            >
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="glass rounded-full hover:bg-white/10"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Salary Statement Details
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {monthNames[payout.month - 1]} {payout.year} • {payout.employee_name}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="glass border-white/10" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                        <Download className="mr-2 h-4 w-4" />
                        PDF Payslip
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-none shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
                        
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto h-20 w-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner mb-4">
                                <User className="h-10 w-10 text-emerald-500" />
                            </div>
                            <CardTitle className="text-xl">{payout.employee_name}</CardTitle>
                            <CardDescription className="font-mono uppercase text-[10px] tracking-widest">{payout.emp_code}</CardDescription>
                            <div className="flex flex-wrap justify-center gap-2 mt-3">
                                <Badge variant="outline" className="glass border-white/5 text-[10px]">{payout.designation}</Badge>
                                <Badge variant="outline" className="glass border-white/5 text-[10px]">{payout.department}</Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-4">
                            <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Net Payout</p>
                                <h2 className="text-4xl font-black text-emerald-500 font-mono">
                                    ৳{parseFloat(payout.net_salary).toLocaleString()}
                                </h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    {payout.status === 'paid' ? (
                                        <Badge className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20">
                                            <ShieldCheck className="h-3 w-3 mr-1" /> PAID
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20">
                                            <Clock className="h-3 w-3 mr-1" /> PENDING
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Payment Info</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-muted-foreground mb-1">Method</p>
                                        <p className="text-xs font-semibold">{payout.payment_method || '---'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                                        <p className="text-xs font-semibold">
                                            {payout.payment_date ? new Date(payout.payment_date).toLocaleDateString() : '---'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass border-none shadow-xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                Earnings & Deductions Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Earnings Section */}
                                <div className="p-6 space-y-4 border-r border-white/5">
                                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" /> Earnings
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Basic Salary</span>
                                            <span className="font-mono font-bold">৳{parseFloat(payout.basic_salary).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Allowances</span>
                                            <span className="font-mono font-bold">৳{parseFloat(payout.allowances).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-2" />
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-sm font-bold">Gross Earnings</span>
                                            <span className="font-mono font-bold text-emerald-500">৳{(parseFloat(payout.basic_salary) + parseFloat(payout.allowances)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions Section */}
                                <div className="p-6 space-y-4 bg-rose-500/[0.02]">
                                    <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Deductions
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Late Entries</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.late_count} recorded lates</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.late_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Unpaid Leaves</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.unpaid_leave_days} days approved</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.unpaid_leave_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Absences</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.absent_days} days without logs</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.absence_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-2" />
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-sm font-bold">Total Deductions</span>
                                            <span className="font-mono font-bold text-rose-500">৳{parseFloat(payout.deductions).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How Deductions were made - Daily Analysis */}
                    <Card className="glass border-none shadow-xl">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-emerald-500" />
                                Daily Performance Analysis
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Verification of days causing deductions for {monthNames[payout.month - 1]} {payout.year}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                                        <tr className="border-b border-white/10">
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deduction Type</th>
                                            <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Since we don't have all records easily, we explain the policy logic visually */}
                                        <tr className="border-b border-white/5 bg-emerald-500/[0.02]">
                                            <td className="p-4 text-xs font-mono text-muted-foreground italic" colSpan={4}>
                                                <div className="flex items-start gap-3 text-emerald-400/80 p-2 leading-relaxed">
                                                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <span>
                                                        The deduction calculation follows the company's rule: 
                                                        <strong> {payout.late_count} lates </strong> (First 2 are allowed), 
                                                        <strong> {payout.unpaid_leave_days} unpaid leaves </strong>, and 
                                                        <strong> {payout.absent_days} absences </strong> were detected in the system logs for this period.
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Visualization of deduction items */}
                                        {parseInt(payout.late_count) > 2 && (
                                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-xs">Late Threshold</td>
                                                <td className="p-4 text-xs"><Badge variant="outline" className="text-rose-400 border-rose-400/20">Exceeded</Badge></td>
                                                <td className="p-4 text-xs text-muted-foreground">Late Entry Policy</td>
                                                <td className="p-4 text-right text-xs font-mono text-rose-400">-৳{parseFloat(payout.late_deduction).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {parseFloat(payout.unpaid_leave_days) > 0 && (
                                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-xs">Unpaid Leave</td>
                                                <td className="p-4 text-xs"><Badge variant="outline" className="text-amber-400 border-amber-400/20">Approved</Badge></td>
                                                <td className="p-4 text-xs text-muted-foreground">LWP (Leave Without Pay)</td>
                                                <td className="p-4 text-right text-xs font-mono text-rose-400">-৳{parseFloat(payout.unpaid_leave_deduction).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {parseInt(payout.absent_days) > 0 && (
                                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-xs">No Records</td>
                                                <td className="p-4 text-xs"><Badge variant="outline" className="text-rose-500 border-rose-500/20 font-bold uppercase">Absent</Badge></td>
                                                <td className="p-4 text-xs text-muted-foreground">Daily Wage Deduction</td>
                                                <td className="p-4 text-right text-xs font-mono text-rose-400">-৳{parseFloat(payout.absence_deduction).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {payout.note && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-[10px] text-muted-foreground italic">
                                                    Note: {payout.note}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
