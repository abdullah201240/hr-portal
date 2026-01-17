'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { leaveApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Loader2,
  FileText,
  ShieldCheck,
  Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LeaveApprovalsPage() {
  const { employeeProfile, isLoading: authLoading } = useEmployeeAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    if (!authLoading && !employeeProfile) {
      router.push('/login/employee');
    }
  }, [employeeProfile, authLoading, router]);

  useEffect(() => {
    if (employeeProfile) {
      fetchApprovals();
    }
  }, [employeeProfile]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getPendingApprovals();
      if (response.success) {
        setApprovals(response.data);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      const response = await leaveApi.updateLeaveStatus(id, status, managerNote);
      if (response.success) {
        toast.success(`Leave request ${status}`);
        setManagerNote('');
        fetchApprovals();
      } else {
        toast.error(response.message || 'Failed to update leave status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">Loading pending requests...</p>
      </div>
    );
  }

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" />
            Leave Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage leave requests from your team members.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
          {pendingCount} Pending Requests
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {approvals.length > 0 ? (
          <AnimatePresence>
            {approvals.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn(
                  "glass border-white/5 transition-all",
                  request.status === 'pending' ? "hover:border-emerald-500/30" : "opacity-70"
                )}>
                  <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <User className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold">{request.employee_name}</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-mono tracking-tighter">
                          {request.employeeId} • {request.leave_type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={cn(
                         "text-[10px] font-bold px-2 py-1 rounded-md uppercase",
                         request.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                         request.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                         "bg-rose-500/10 text-rose-500"
                       )}>
                         {request.status}
                       </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Period</Label>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-emerald-500" />
                              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Duration</Label>
                            <p className="text-sm font-bold text-emerald-500">{request.days} Days</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">Reason</Label>
                          <p className="text-sm bg-white/5 p-3 rounded-xl italic border border-white/5">
                            "{request.reason || 'No reason provided.'}"
                          </p>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="space-y-4 pt-2 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
                           <div className="space-y-2">
                              <Label className="text-[10px] text-muted-foreground uppercase">Manager's Note (Optional)</Label>
                              <Textarea 
                                placeholder="Add a note..."
                                value={managerNote}
                                onChange={(e) => setManagerNote(e.target.value)}
                                className="glass text-xs min-h-[80px]"
                              />
                           </div>
                           <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 h-9"
                                onClick={() => handleAction(request.id, 'rejected')}
                                disabled={processingId === request.id}
                              >
                                {processingId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-2" />}
                                Reject
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 gradient-emerald h-9 shadow-lg shadow-emerald-500/10"
                                onClick={() => handleAction(request.id, 'approved')}
                                disabled={processingId === request.id}
                              >
                                {processingId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                                Approve
                              </Button>
                           </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="glass border-dashed border-2 border-white/10 py-20">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-emerald-500/5">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">Clean slate!</p>
                <p className="text-sm text-muted-foreground">There are no pending leave requests to approve.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
