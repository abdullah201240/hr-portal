'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { leaveApi, leavePolicyApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Plane, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LeavePage() {
  const { employeeProfile, isLoading: authLoading } = useEmployeeAuth();
  const router = useRouter();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'own' | 'approval'>('own');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [managerNote, setManagerNote] = useState('');

  const [formData, setFormData] = useState({
    leave_policy_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    if (!authLoading && !employeeProfile) {
      router.push('/login/employee');
    }
  }, [employeeProfile, authLoading, router]);

  useEffect(() => {
    if (employeeProfile) {
      fetchData();
    }
  }, [employeeProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, policiesRes, approvalsRes] = await Promise.all([
        leaveApi.getMyLeaves(),
        leavePolicyApi.getLeavePolicies(),
        leaveApi.getPendingApprovals()
      ]);
      if (leavesRes.success) setLeaves(leavesRes.data);
      if (policiesRes.success) setPolicies(policiesRes.data.filter((p: any) => p.enabled));
      if (approvalsRes.success) setApprovals(approvalsRes.data);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(formData.start_date, formData.end_date);
    if (days <= 0) {
      toast.error('End date must be after or equal to start date');
      return;
    }

    try {
      setSubmitting(true);
      const response = await leaveApi.applyLeave({
        ...formData,
        days
      });

      if (response.success) {
        toast.success('Leave application submitted');
        setShowApplyForm(false);
        setFormData({ leave_policy_id: '', start_date: '', end_date: '', reason: '' });
        fetchData();
      } else {
        toast.error(response.message || 'Failed to submit leave');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error submitting leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovalAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      const response = await leaveApi.updateLeaveStatus(id, status, managerNote);
      if (response.success) {
        toast.success(`Leave request ${status}`);
        setManagerNote('');
        fetchData(); // Refresh all data
      } else {
        toast.error(response.message || 'Failed to update leave status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApprovalCount = approvals.filter(a => a.status === 'pending').length;

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">Loading leave records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="text-emerald-500" />
            Leave Management
          </h1>
          {activeTab === 'own' && (
            <Button 
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="gradient-emerald shadow-lg shadow-emerald-500/20"
            >
              {showApplyForm ? 'View My Leaves' : <><Plus className="h-4 w-4 mr-2" /> Apply for Leave</>}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {activeTab === 'own' 
            ? 'Apply for leave and track your application status.' 
            : 'Manage leave requests from your team members.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('own')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'own'
              ? "bg-emerald-500 text-white shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <User className="h-4 w-4" />
          Own Leaves
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative",
            activeTab === 'approval'
              ? "bg-emerald-500 text-white shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          Approval ({pendingApprovalCount})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'own' ? (
          showApplyForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="glass border-emerald-500/10 shadow-xl overflow-hidden">
                <CardHeader className="bg-emerald-500/5 border-b border-white/5">
                  <CardTitle className="text-lg">New Leave Application</CardTitle>
                  <CardDescription>All leave requests are routed to your line manager for approval.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select 
                          value={formData.leave_policy_id} 
                          onValueChange={(v) => setFormData({...formData, leave_policy_id: v})}
                        >
                          <SelectTrigger className="glass border-white/10 h-11">
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent className="glass">
                            {policies.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name} ({p.days} days/year)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="date" 
                            value={formData.start_date}
                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            className="glass border-white/10 h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input 
                            type="date" 
                            value={formData.end_date}
                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            className="glass border-white/10 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea 
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Please provide a reason for your leave..."
                        className="glass border-white/10 min-h-[100px]"
                      />
                    </div>

                    {formData.start_date && formData.end_date && (
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Total Requested Duration:</span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {calculateDays(formData.start_date, formData.end_date)} Days
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setShowApplyForm(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting || !formData.leave_policy_id || !formData.start_date || !formData.end_date}
                        className="gradient-emerald px-8"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plane className="h-4 w-4 mr-2" />}
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="own-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="glass border-none shadow-none rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead className="bg-emerald-500/5 border-b border-white/10">
                        <tr>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leave Type</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaves.length > 0 ? (
                          leaves.map((leave, index) => (
                            <motion.tr
                              key={leave.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "hover:bg-white/5 transition-colors",
                                leave.status === 'approved' ? "border-l-4 border-l-emerald-500" : 
                                leave.status === 'rejected' ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-amber-500"
                              )}
                            >
                              <td className="py-4 px-6">
                                <div className="font-bold text-foreground">{leave.leave_type}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-foreground">
                                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">({leave.days} days)</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {leave.status === 'approved' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                  {leave.status === 'rejected' && <XCircle className="h-4 w-4 text-rose-500" />}
                                  {leave.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                                  <span className={cn(
                                    "text-sm font-bold capitalize px-2 py-1 rounded-md",
                                    leave.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : 
                                    leave.status === 'rejected' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                  )}>
                                    {leave.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {leave.manager_note ? (
                                  <div className="text-sm italic text-muted-foreground">
                                    "{leave.manager_note}"
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground/50">-</div>
                                )}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-20 text-center">
                              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Plane className="h-16 w-16 opacity-10" />
                                <div>
                                  <p className="font-bold text-lg">No leave applications yet</p>
                                  <p className="text-sm">When you apply for leaves, they will appear here.</p>
                                </div>
                                <Button onClick={() => setShowApplyForm(true)} variant="outline" className="mt-2 glass">
                                  Apply Now
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        ) : (
          <motion.div
            key="approval-table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="glass border-none shadow-none rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-emerald-500/5 border-b border-white/10">
                      <tr>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leave Type</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {approvals.length > 0 ? (
                        approvals.map((request, index) => (
                          <motion.tr
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "hover:bg-white/5 transition-colors",
                              request.status === 'pending' ? "" : "opacity-70",
                              request.status === 'approved' ? "border-l-4 border-l-emerald-500" : 
                              request.status === 'rejected' ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-amber-500"
                            )}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                  <User className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground">{request.employee_name}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{request.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-foreground">{request.leave_type}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-foreground">
                                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-emerald-500 font-bold mt-1">({request.days} days)</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm max-w-xs truncate" title={request.reason || 'No reason provided'}>
                                {request.reason || 'No reason provided'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-md uppercase",
                                request.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                request.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                                "bg-rose-500/10 text-rose-500"
                              )}>
                                {request.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {request.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                                    onClick={() => handleApprovalAction(request.id, 'rejected')}
                                    disabled={processingId === request.id}
                                  >
                                    {processingId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="h-8 gradient-emerald shadow-lg shadow-emerald-500/10"
                                    onClick={() => handleApprovalAction(request.id, 'approved')}
                                    disabled={processingId === request.id}
                                  >
                                    {processingId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">Processed</div>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                              <ShieldCheck className="h-16 w-16 opacity-10" />
                              <div>
                                <p className="font-bold text-lg">Clean slate!</p>
                                <p className="text-sm">There are no pending leave requests to approve.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
