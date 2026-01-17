'use client';

import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { motion } from 'framer-motion';
import { salaryApi } from '@/lib/api';
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
    TrendingUp,
    FileText,
    Loader2,
    ShieldCheck,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

export default function EmployeePayoutDetailPage() {
    const { isAuthenticated, isLoading: authLoading } = useEmployeeAuth();
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [payout, setPayout] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/employee');
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
            } else {
                toast.error(response.message);
                router.push('/employee/salary');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load details');
        } finally {
            setLoading(false);
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
                        Salary Statement
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {monthNames[payout.month - 1]} {payout.year}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="glass border-white/10" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-none shadow-2xl overflow-hidden relative">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto h-20 w-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner mb-4">
                                <User className="h-10 w-10 text-emerald-500" />
                            </div>
                            <CardTitle className="text-xl">{payout.employee_name}</CardTitle>
                            <CardDescription className="font-mono uppercase text-[10px] tracking-widest">{payout.emp_code}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-4">
                            <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Net Payout</p>
                                <h2 className="text-4xl font-black text-emerald-500 font-mono">
                                    ৳{parseFloat(payout.net_salary).toLocaleString()}
                                </h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    {payout.status === 'paid' ? (
                                        <Badge className="bg-emerald-500 text-white border-none">
                                            <ShieldCheck className="h-3 w-3 mr-1" /> PAID
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-500 text-white border-none">
                                            <Clock className="h-3 w-3 mr-1" /> PENDING
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
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

                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass border-none shadow-xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                Earnings & Deductions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
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
                                        <div className="flex justify-between items-center pt-1 font-bold">
                                            <span>Gross Earnings</span>
                                            <span className="font-mono text-emerald-500">৳{(parseFloat(payout.basic_salary) + parseFloat(payout.allowances)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 bg-rose-500/[0.02]">
                                    <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Deductions
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Late Entries</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.late_count} logs</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.late_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Unpaid Leaves</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.unpaid_leave_days} days</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.unpaid_leave_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Absences</p>
                                                <p className="text-[10px] text-rose-400/60">{payout.absent_days} days</p>
                                            </div>
                                            <span className="font-mono font-bold text-rose-400">-৳{parseFloat(payout.absence_deduction).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-2" />
                                        <div className="flex justify-between items-center pt-1 font-bold">
                                            <span>Total Deductions</span>
                                            <span className="font-mono text-rose-500">৳{parseFloat(payout.deductions).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-none shadow-xl">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Info className="h-4 w-4 text-emerald-500" />
                                System Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 text-sm text-muted-foreground leading-relaxed">
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                    <Clock className="h-5 w-5 text-emerald-500" />
                                </div>
                                <p>
                                    Your salary for this month was calculated based on your attendance logs and approved leave requests. 
                                    A total of <strong>{payout.late_count} lates</strong>, <strong>{payout.unpaid_leave_days} unpaid leaves</strong>, 
                                    and <strong>{payout.absent_days} absences</strong> were detected. 
                                    Deductions were applied according to the company's HR policy.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
