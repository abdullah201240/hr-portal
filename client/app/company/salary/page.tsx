'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { motion } from 'framer-motion';
import { employeeApi, salaryApi } from '@/lib/api';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Coins,
    TrendingUp,
    History,
    Search,
    User,
    ArrowUpRight,
    Download,
    Plus,
    ShieldCheck,
    Loader2,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SalaryPage() {
    const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('employees');

    // Backend Stats
    const [stats, setStats] = useState<any>({
        totalEmployees: 0,
        activeEmployees: 0,
        totalPayroll: 0,
        averageSalary: 0,
        totalIncrements: 0
    });

    // All History
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [loadingAllHistory, setLoadingAllHistory] = useState(false);

    // State for Bulk Setup
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkSalaries, setBulkSalaries] = useState<Record<number, string>>({});
    const [bulkReason, setBulkReason] = useState('Initial Salary Setup');
    const [submittingBulk, setSubmittingBulk] = useState(false);

    // State for Increment Modal
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [showIncrementModal, setShowIncrementModal] = useState(false);
    const [incrementType, setIncrementType] = useState<'amount' | 'percentage' | 'fixed'>('fixed');
    const [incrementValue, setIncrementValue] = useState('');
    const [incrementDate, setIncrementDate] = useState(new Date().toISOString().split('T')[0]);
    const [incrementReason, setIncrementReason] = useState('Annual Increment');
    const [submitting, setSubmitting] = useState(false);

    // State for History Modal
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login/company');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchEmployees();
            fetchStats();
            fetchAllHistory();
        }
    }, [isAuthenticated]);

    const fetchStats = async () => {
        try {
            const response = await salaryApi.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAllHistory = async () => {
        try {
            setLoadingAllHistory(true);
            const response = await salaryApi.getAllHistory();
            if (response.success) {
                setAllHistory(response.data);
            }
        } catch (error) {
            console.error('Error fetching all history:', error);
        } finally {
            setLoadingAllHistory(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeApi.getAllEmployees({ limit: 1000 }); // Get all for now
            if (response.success) {
                setEmployees(response.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employee list');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryHistory = async (employeeId: number) => {
        try {
            setLoadingHistory(true);
            const response = await salaryApi.getHistory(employeeId);
            if (response.success) {
                setSalaryHistory(response.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load salary history');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleOpenIncrement = (employee: any) => {
        setSelectedEmployee(employee);
        setIncrementValue('');
        setIncrementReason('Annual Increment');
        setIncrementType('fixed');
        setShowIncrementModal(true);
    };

    const handleOpenBulk = () => {
        const initialSalaries: Record<number, string> = {};
        employees.forEach(emp => {
            initialSalaries[emp.id] = emp.salary || '0';
        });
        setBulkSalaries(initialSalaries);
        setShowBulkModal(true);
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmittingBulk(true);
            const updates = Object.entries(bulkSalaries).map(([id, salary]) => ({
                employee_id: parseInt(id),
                salary: parseFloat(salary)
            }));

            const response = await salaryApi.bulkUpdateSalaries({
                updates,
                reason: bulkReason
            });

            if (response.success) {
                toast.success(response.message);
                setShowBulkModal(false);
                fetchEmployees();
                fetchStats();
                fetchAllHistory();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update salaries');
        } finally {
            setSubmittingBulk(false);
        }
    };

    const handleOpenHistory = (employee: any) => {
        setSelectedEmployee(employee);
        setSalaryHistory([]); // Clear previous
        setShowHistoryModal(true);
        fetchSalaryHistory(employee.id);
    };

    const calculateNewSalary = () => {
        if (!selectedEmployee || !incrementValue) return parseFloat(selectedEmployee?.salary || 0);

        const current = parseFloat(selectedEmployee.salary || 0);
        const value = parseFloat(incrementValue);

        if (isNaN(value)) return current;

        if (incrementType === 'amount') {
            return current + value;
        } else if (incrementType === 'percentage') {
            return current + (current * value / 100);
        } else {
            return value;
        }
    };

    const handleIncrementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            setSubmitting(true);
            const payload: any = {
                employee_id: selectedEmployee.id,
                increment_date: incrementDate,
                reason: incrementReason
            };

            if (incrementType === 'amount') {
                payload.increment_amount = parseFloat(incrementValue);
            } else if (incrementType === 'percentage') {
                payload.increment_percentage = parseFloat(incrementValue);
            } else {
                payload.new_salary = parseFloat(incrementValue);
            }

            const response = await salaryApi.addIncrement(payload);

            if (response.success) {
                toast.success(`Salary updated for ${selectedEmployee.name}`);
                setShowIncrementModal(false);
                fetchEmployees();
                fetchStats();
                fetchAllHistory();
            } else {
                toast.error(response.message || 'Failed to update salary');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating salary');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        Salary Management
                    </h1>
                    <p className="text-muted-foreground">Manage employee salaries, increments, and view history.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleOpenBulk}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-11"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Bulk Salary Setup
                    </Button>
                    <Button 
                        onClick={() => router.push('/company/payroll')}
                        className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 h-11"
                    >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Generate Payroll
                    </Button>
                    <Button variant="outline" className="glass border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-11">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { 
                        label: 'Total Employees', 
                        value: stats.totalEmployees, 
                        icon: User, 
                        colorClass: 'border-blue-500/20 hover:border-blue-500/40',
                        bgClass: 'from-blue-500 to-cyan-500',
                        iconColor: 'text-blue-600 dark:text-blue-400',
                        iconBg: 'from-blue-500/30 to-cyan-500/30',
                        glowColor: 'from-blue-400 to-cyan-500',
                        pulseColor: 'bg-blue-500/20'
                    },
                    { 
                        label: 'Active Payroll', 
                        value: stats.activeEmployees, 
                        icon: CheckCircle2, 
                        colorClass: 'border-emerald-500/20 hover:border-emerald-500/40',
                        bgClass: 'from-emerald-400 to-teal-500',
                        iconColor: 'text-emerald-600 dark:text-emerald-400',
                        iconBg: 'from-emerald-500/30 to-teal-500/30',
                        glowColor: 'from-emerald-400 to-teal-500',
                        pulseColor: 'bg-emerald-500/20'
                    },
                    { 
                        label: 'Total Monthly Payroll', 
                        value: `৳${stats.totalPayroll.toLocaleString()}`, 
                        icon: Coins, 
                        colorClass: 'border-amber-500/20 hover:border-amber-500/40',
                        bgClass: 'from-amber-500 to-orange-500',
                        iconColor: 'text-amber-600 dark:text-amber-400',
                        iconBg: 'from-amber-500/30 to-orange-500/30',
                        glowColor: 'from-amber-400 to-orange-500',
                        pulseColor: 'bg-amber-500/20'
                    },
                    { 
                        label: 'Recent Revisions', 
                        value: stats.totalIncrements, 
                        icon: History, 
                        colorClass: 'border-purple-500/20 hover:border-purple-500/40',
                        bgClass: 'from-purple-500 to-pink-500',
                        iconColor: 'text-purple-600 dark:text-purple-400',
                        iconBg: 'from-purple-500/30 to-pink-500/30',
                        glowColor: 'from-purple-400 to-pink-500',
                        pulseColor: 'bg-purple-500/20'
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <Card className={`relative glass ${stat.colorClass} overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                            {/* 3D Background Graphics */}
                            <div className="absolute inset-0 opacity-30">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.glowColor} blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr ${stat.glowColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700`} />
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${stat.pulseColor} rounded-full blur-xl animate-pulse`} />
                            </div>

                            <CardContent className="relative p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-foreground/70 mb-1.5">{stat.label}</p>
                                        <motion.h3
                                            className="text-2xl font-bold bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                                            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        >
                                            {stat.value}
                                        </motion.h3>
                                    </div>
                                    <motion.div
                                        className="relative"
                                        animate={{ 
                                            rotate: [0, 5, 0, -5, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ 
                                            duration: 4, 
                                            repeat: Infinity, 
                                            ease: "easeInOut",
                                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                    >
                                        <div className={`absolute inset-0 bg-linear-to-br ${stat.bgClass} rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity`} />
                                        <div className={`relative bg-linear-to-br ${stat.iconBg} p-3 rounded-xl backdrop-blur-sm border border-white/10`}>
                                            <stat.icon className={`h-6 w-6 ${stat.iconColor} drop-shadow-lg`} />
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex p-1 glass border-white/10 rounded-xl bg-white/5">
                            <button
                                onClick={() => setActiveTab('employees')}
                                className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === 'employees'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                <User className="h-4 w-4 mr-2" />
                                Payroll List
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                <History className="h-4 w-4 mr-2" />
                                Revision History
                            </button>
                        </div>
                    </div>

                    {activeTab === 'employees' ? (
                        <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
                            <CardHeader className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="relative w-full md:w-[400px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, ID or designation..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-11 glass border-white/10"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-emerald-500/5 border-b border-white/5">
                                            <TableRow className="hover:bg-transparent border-white/5">
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Designation</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Salary</TableHead>
                                                <TableHead className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                                                            Loading payroll data...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredEmployees.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                        No employees found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredEmployees.map((employee) => (
                                                    <TableRow key={employee.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                                    <User className="h-5 w-5 text-emerald-500" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-foreground">{employee.name}</div>
                                                                    <div className="text-xs text-muted-foreground font-mono uppercase">{employee.employeeId}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6">
                                                            <span className="text-sm font-medium">{employee.designation || '-'}</span>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex items-center gap-2 font-mono font-bold text-emerald-500">
                                                                <Coins className="h-4 w-4" />
                                                                {employee.salary ? `৳${parseFloat(employee.salary).toLocaleString()}` : 'Not Set'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-emerald-500 hover:bg-emerald-500/10"
                                                                    onClick={() => handleOpenHistory(employee)}
                                                                >
                                                                    <History className="h-4 w-4 mr-2" />
                                                                    History
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                                    onClick={() => handleOpenIncrement(employee)}
                                                                >
                                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                                    Increment
                                                                </Button>
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
                    ) : (
                        <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
                            <CardHeader className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
                                <CardTitle>Global Revision History</CardTitle>
                                <CardDescription>All salary adjustments across the company</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-emerald-500/5 border-b border-white/5">
                                            <TableRow className="hover:bg-transparent border-white/5">
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Previous</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Salary</TableHead>
                                                <TableHead className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingAllHistory ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                                                            Loading history...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : allHistory.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                        No revisions found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                allHistory.map((record) => (
                                                    <TableRow key={record.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {new Date(record.increment_date).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6">
                                                            <div className="font-medium text-foreground">{record.employee_name}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{record.employeeId}</div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6 text-muted-foreground/70 font-mono">
                                                            ৳{parseFloat(record.previous_salary || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-emerald-500 font-mono">৳{parseFloat(record.current_salary).toLocaleString()}</span>
                                                                {parseFloat(record.increment_amount) > 0 && (
                                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-4 px-1">
                                                                        +{record.increment_percentage}%
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                                            {record.reason || 'Annual Increment'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </motion.div>

            {/* Bulk Increment Modal - Reused existing UI patterns */}
            <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
                <DialogContent className="max-w-2xl glass border-emerald-500/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Bulk Salary Setup
                        </DialogTitle>
                        <DialogDescription className="text-emerald-400/60">
                            Update the base salary for multiple employees at once.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBulkSubmit} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 font-semibold text-sm text-emerald-400 pb-2 border-b border-emerald-500/10">
                                <div>Employee</div>
                                <div>Monthly Salary (৳)</div>
                            </div>
                            
                            <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="grid grid-cols-2 gap-4 items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{emp.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{emp.designation}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                                            <Input
                                                type="number"
                                                value={bulkSalaries[emp.id] || ''}
                                                onChange={(e) => setBulkSalaries({ ...bulkSalaries, [emp.id]: e.target.value })}
                                                className="pl-7 bg-emerald-950/20 border-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Update Reason</Label>
                            <Input
                                value={bulkReason}
                                onChange={(e) => setBulkReason(e.target.value)}
                                className="bg-emerald-950/20 border-emerald-500/20"
                                placeholder="e.g. Annual Adjustment, Promotion, Initial Setup"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowBulkModal(false)}
                                className="glass border-emerald-500/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submittingBulk}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
                            >
                                {submittingBulk ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Update All'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Increment Modal */}
            <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
                <DialogContent className="max-w-2xl glass border-emerald-500/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Bulk Salary Setup
                        </DialogTitle>
                        <DialogDescription className="text-emerald-400/60">
                            Update the base salary for multiple employees at once.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBulkSubmit} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 font-semibold text-sm text-emerald-400 pb-2 border-b border-emerald-500/10">
                                <div>Employee</div>
                                <div>Monthly Salary (৳)</div>
                            </div>
                            
                            <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="grid grid-cols-2 gap-4 items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{emp.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{emp.designation}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                                            <Input
                                                type="number"
                                                value={bulkSalaries[emp.id] || ''}
                                                onChange={(e) => setBulkSalaries({ ...bulkSalaries, [emp.id]: e.target.value })}
                                                className="pl-7 bg-emerald-950/20 border-emerald-500/20 focus:border-emerald-500 transition-all text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Update Reason</Label>
                            <Input
                                value={bulkReason}
                                onChange={(e) => setBulkReason(e.target.value)}
                                className="bg-emerald-950/20 border-emerald-500/20 text-white"
                                placeholder="e.g. Annual Adjustment, Promotion, Initial Setup"
                            />
                        </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowBulkModal(false)}
                                className="glass border-emerald-500/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submittingBulk}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
                            >
                                {submittingBulk ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : 'Update All'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Increment Modal */}
            <Dialog open={showIncrementModal} onOpenChange={setShowIncrementModal}>
                <DialogContent className="glass sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Salary</DialogTitle>
                        <DialogDescription>
                            Adjust salary for {selectedEmployee?.name} ({selectedEmployee?.employeeId})
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleIncrementSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Salary</Label>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-muted-foreground flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-emerald-500/50" />
                                    {selectedEmployee?.salary ? `৳${parseFloat(selectedEmployee.salary).toLocaleString()}` : '৳0'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Salary Preview</Label>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-emerald-500 font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    ৳{calculateNewSalary().toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <Input
                                type="date"
                                value={incrementDate}
                                onChange={(e) => setIncrementDate(e.target.value)}
                                className="glass border-white/10"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-2">
                                <Label>Type</Label>
                                <Select value={incrementType} onValueChange={(v: any) => setIncrementType(v)}>
                                    <SelectTrigger className="glass border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass">
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        <SelectItem value="amount">Add Amount (+)</SelectItem>
                                        <SelectItem value="percentage">Percentage (+%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>
                                    {incrementType === 'fixed' ? 'New Total Salary' :
                                        incrementType === 'amount' ? 'Increment Amount' : 'Increment Percentage'}
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={incrementValue}
                                    onChange={(e) => setIncrementValue(e.target.value)}
                                    className="glass border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Textarea
                                value={incrementReason}
                                onChange={(e) => setIncrementReason(e.target.value)}
                                className="glass border-white/10"
                                placeholder="e.g. Annual Appraisal, Promotion..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setShowIncrementModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                                Update Salary
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="glass sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Salary History</DialogTitle>
                        <DialogDescription>
                            Complete salary revision history for {selectedEmployee?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {loadingHistory ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            </div>
                        ) : salaryHistory.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-white/10 rounded-lg">
                                No salary history records found.
                            </div>
                        ) : (
                            <div className="relative border-l border-white/10 ml-4 space-y-8 py-2">
                                {salaryHistory.map((record, index) => (
                                    <div key={record.id} className="relative pl-6 group">
                                        <div className="absolute left-0 top-0 -translate-x-[5px] h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-background" />
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{new Date(record.increment_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                <h4 className="text-lg font-bold text-foreground mt-1">{record.reason || 'Increment'}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-emerald-500">
                                                    ৳{parseFloat(record.current_salary).toLocaleString()}
                                                </p>
                                                {parseFloat(record.increment_amount) > 0 && (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        <span>
                                                            +৳{parseFloat(record.increment_amount).toLocaleString()}
                                                            {record.increment_percentage > 0 && ` (${record.increment_percentage}%)`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/5 text-sm">
                                            <div className="flex justify-between text-muted-foreground text-xs uppercase mb-2 tracking-wider">
                                                <span>Previous Salary</span>
                                                <span>New Salary</span>
                                            </div>
                                            <div className="flex justify-between font-mono items-center">
                                                <span className="text-muted-foreground/70">৳{parseFloat(record.previous_salary || 0).toLocaleString()}</span>
                                                <div className="h-px flex-1 border-t border-dashed border-white/10 mx-4" />
                                                <span className="text-foreground font-bold">৳{parseFloat(record.current_salary).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
