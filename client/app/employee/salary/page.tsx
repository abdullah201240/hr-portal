'use client';

import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { motion } from 'framer-motion';
import { salaryApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Banknote, 
    Calendar, 
    Download, 
    Loader2, 
    CheckCircle2, 
    Clock,
    User,
    Coins,
    TrendingUp,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MySalaryPage() {
    const { isAuthenticated, isLoading: authLoading, employeeProfile } = useEmployeeAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/employee');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyPayouts();
        }
    }, [isAuthenticated]);

    const fetchMyPayouts = async () => {
        try {
            setLoading(true);
            const response = await salaryApi.getMyPayouts();
            if (response.success) {
                setPayouts(response.data);
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to load salary history');
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

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
                        My Salary & Payouts
                    </h1>
                    <p className="text-muted-foreground">View your monthly salary statements and payment history.</p>
                </div>
                <Button variant="outline" className="glass border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-11">
                    <Download className="mr-2 h-4 w-4" />
                    Download Statement
                </Button>
            </motion.div>

            {/* Current Salary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass border-none shadow-none overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 blur-3xl -mr-32 -mt-32 rounded-full animate-pulse" />
                    </div>
                    <CardContent className="p-8 relative">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
                                    <Banknote className="h-10 w-10 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-1">Current Gross Salary</p>
                                    <h2 className="text-4xl font-bold text-foreground font-mono">
                                        ৳{parseFloat(employeeProfile?.salary || '0').toLocaleString()}
                                    </h2>
                                </div>
                            </div>
                            <div className="h-px w-full md:w-px md:h-16 bg-white/10" />
                            <div className="flex flex-col items-center md:items-start">
                                <p className="text-sm text-muted-foreground font-medium mb-2">Payment Status</p>
                                {payouts[0]?.status === 'paid' ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1 text-sm">
                                        Last Payout: {getMonthName(payouts[0].month)} Paid
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1 text-sm">
                                        Next Payout Pending
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Payout History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 bg-white/5 border-b border-white/10">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-500" />
                            Payment History
                        </CardTitle>
                        <CardDescription>Monthly disbursement records</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-emerald-500/5 border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month & Year</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statement</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : payouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                No payment records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payouts.map((payout) => (
                                            <TableRow key={payout.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{getMonthName(payout.month)}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{payout.year}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <div className="font-mono font-bold text-emerald-500">
                                                        ৳{parseFloat(payout.net_salary).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                                    {payout.payment_method || '-'}
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    {payout.status === 'paid' ? (
                                                        <div className="flex flex-col">
                                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 w-fit">
                                                                Paid
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground mt-1">
                                                                {new Date(payout.payment_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 w-fit">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    <Button variant="ghost" size="sm" className="text-emerald-500 hover:bg-emerald-500/10">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        PDF
                                                    </Button>
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
