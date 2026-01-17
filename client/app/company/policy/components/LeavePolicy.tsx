'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plane, ShieldCheck, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { leavePolicyApi } from '@/lib/api';
import { toast } from 'sonner';

export function LeavePolicy() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    days: 0,
    is_paid: true
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await leavePolicyApi.getLeavePolicies();
      if (response.success) {
        setLeaveTypes(response.data);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load leave policies');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddLeaveType = () => {
    if (newLeaveType.name && newLeaveType.days > 0) {
      const tempId = Date.now(); // Temporary ID for UI tracking
      setLeaveTypes([...leaveTypes, { 
        id: `new_${tempId}`, 
        name: newLeaveType.name, 
        days: newLeaveType.days,
        is_paid: newLeaveType.is_paid,
        enabled: true
      }]);
      setNewLeaveType({ name: '', days: 0, is_paid: true });
      setIsOpen(false);
    }
  };
  
  const handleDeleteLeaveType = (id: any) => {
    setLeaveTypes(leaveTypes.filter(type => type.id !== id));
  };
  
  const toggleLeaveType = (id: any) => {
    setLeaveTypes(leaveTypes.map(type => 
      type.id === id ? { ...type, enabled: !type.enabled } : type
    ));
  };

  const handleUpdateDays = (id: any, days: number) => {
    setLeaveTypes(leaveTypes.map(type => 
      type.id === id ? { ...type, days } : type
    ));
  };

  const togglePaid = (id: any) => {
    setLeaveTypes(leaveTypes.map(type => 
      type.id === id ? { ...type, is_paid: !type.is_paid } : type
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await leavePolicyApi.syncLeavePolicies(leaveTypes);
      if (response.success) {
        toast.success('Leave policies saved successfully');
        fetchPolicies();
      }
    } catch (error: any) {
      console.error('Error saving policies:', error);
      toast.error(error.message || 'Failed to save leave policies');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass  overflow-hidden shadow-none border-none rounded-none">
      <CardHeader className="p-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plane className="size-4 text-emerald-400" />
          Leave Types
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 glass border-white/10 text-xs">
              <Plus className="size-3 mr-2" />
              Add Type
            </Button>
          </DialogTrigger>
          {/* ... dialog content remains same but with glass styling ... */}
          <DialogContent className="glass  sm:max-w-md bg-muted">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                New Leave Type
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Type Name</Label>
                <Input
                  value={newLeaveType.name}
                  onChange={(e) => setNewLeaveType({...newLeaveType, name: e.target.value})}
                  placeholder="e.g. Paternity Leave"
                  className="h-8 text-sm glass border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Days Per Year</Label>
                <Input
                  type="number"
                  value={newLeaveType.days || ''}
                  onChange={(e) => setNewLeaveType({...newLeaveType, days: parseInt(e.target.value) || 0})}
                  className="h-8 text-sm glass border-white/10"
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-xs">Paid Leave</Label>
                  <p className="text-[10px] text-muted-foreground">Is this a paid leave type?</p>
                </div>
                <input 
                  type="checkbox"
                  checked={newLeaveType.is_paid}
                  onChange={(e) => setNewLeaveType({...newLeaveType, is_paid: e.target.checked})}
                  className="size-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddLeaveType} disabled={!newLeaveType.name || newLeaveType.days <= 0} className="gradient-emerald">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="size-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading policies...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {leaveTypes.map((type) => (
                <div 
                  key={type.id} 
                  className="p-3 rounded-xl glass border border-white/5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => toggleLeaveType(type.id)}
                    >
                      <div className={cn(
                        "size-1.5 rounded-full",
                        type.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/40"
                      )} />
                      <h4 className={cn(
                        "text-xs font-bold transition-colors",
                        type.enabled ? "text-foreground" : "text-muted-foreground"
                      )}>{type.name}</h4>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleDeleteLeaveType(type.id)}
                      className="h-6 w-6 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/5"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          value={type.days} 
                          onChange={(e) => handleUpdateDays(type.id, parseInt(e.target.value) || 0)}
                          className="h-7 w-16 text-xs text-center glass border-white/10 p-0" 
                        />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Days/Year</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        type.is_paid ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {type.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                      <input 
                        type="checkbox"
                        checked={type.is_paid}
                        onChange={() => togglePaid(type.id)}
                        className="size-3 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="h-8 text-xs px-6 gradient-emerald shadow-lg shadow-emerald-500/10"
              >
                {saving ? (
                  <Loader2 className="size-3 mr-2 animate-spin" />
                ) : (
                  <Save className="size-3 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Policies'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
