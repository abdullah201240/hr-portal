'use client';

import React, { useState, useEffect } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { employeeApi, salaryApi } from '@/lib/api';
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
    Loader2,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SalaryPage() {
    const { companyProfile, isLoading: authLoading } = useCompanyAuth();
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        if (!authLoading && !companyProfile) {
            router.push('/login/company');
        }
    }, [companyProfile, authLoading, router]);

    useEffect(() => {
        if (companyProfile) {
            fetchEmployees();
        }
    }, [companyProfile]);

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

    const handleOpenHistory = (employee: any) => {
        setSelectedEmployee(employee);
        setSalaryHistory([]); // Clear previous
        setShowHistoryModal(true);
        fetchSalaryHistory(employee.id);
    };

    const calculateNewSalary = () => {
        if (!selectedEmployee || !incrementValue) return selectedEmployee?.salary || 0;

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
                fetchEmployees(); // Refresh list to show new salary
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

    if (authLoading) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Salary Management
                    </h1>
                    <p className="text-muted-foreground">Manage employee salaries, increments, and view history.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="glass border-amber-500/20 text-amber-500 hover:bg-amber-500/10">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <Card className="glass border-white/10">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, ID or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 glass border-white/10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-amber-500">Employee</TableHead>
                                    <TableHead className="text-amber-500">Designation</TableHead>
                                    <TableHead className="text-amber-500">Current Salary</TableHead>
                                    <TableHead className="text-amber-500 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-r-transparent"></div>
                                                Loading employee data...
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
                                        <TableRow key={employee.id} className="hover:bg-white/5 border-white/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                        <User className="h-4 w-4 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{employee.name}</div>
                                                        <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{employee.designation || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-mono font-bold text-emerald-500">
                                                    <Coins className="h-4 w-4" />
                                                    {parseFloat(employee.salary || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20"
                                                        onClick={() => handleOpenHistory(employee)}
                                                    >
                                                        <History className="h-4 w-4 mr-2" />
                                                        History
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
                                <div className="p-2 rounded-md bg-white/5 border border-white/10 font-mono text-muted-foreground">
                                    {parseFloat(selectedEmployee?.salary || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Salary Preview</Label>
                                <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-mono text-emerald-500 font-bold">
                                    {calculateNewSalary().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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
                                                    {parseFloat(record.current_salary).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </p>
                                                {parseFloat(record.increment_amount) > 0 && (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        <span>
                                                            {parseFloat(record.increment_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                            {record.increment_percentage > 0 && ` (${record.increment_percentage}%)`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/5 text-sm">
                                            <div className="flex justify-between text-muted-foreground text-xs uppercase mb-1">
                                                <span>Previous Salary</span>
                                                <span>New Salary</span>
                                            </div>
                                            <div className="flex justify-between font-mono">
                                                <span>{parseFloat(record.previous_salary || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                                <span className="text-foreground">{parseFloat(record.current_salary).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
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
