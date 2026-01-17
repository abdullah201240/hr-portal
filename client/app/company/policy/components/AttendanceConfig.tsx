'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Calendar, Save, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { policyApi } from '@/lib/api';
import { toast } from 'sonner';

export function AttendanceConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [officeStart, setOfficeStart] = useState('09:00');
  const [officeEnd, setOfficeEnd] = useState('18:00');
  const [lateAllow, setLateAllow] = useState(15);
  const [grace, setGrace] = useState(30);
  const [maxLateAllowed, setMaxLateAllowed] = useState(2);
  const [lateDeductionAmount, setLateDeductionAmount] = useState(0);
  const [lateDeductionType, setLateDeductionType] = useState('fixed');
  const [weeklyHolidays, setWeeklyHolidays] = useState<string[]>(['Friday']);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await policyApi.getAttendancePolicy();
      if (response.success && response.data) {
        const data = response.data;
        // Times from DB are HH:mm:ss, but input type="time" expects HH:mm
        setOfficeStart(data.office_start_time.substring(0, 5));
        setOfficeEnd(data.office_end_time.substring(0, 5));
        setLateAllow(data.late_allow_minutes);
        setGrace(data.grace_minutes);
        setMaxLateAllowed(data.max_late_allowed || 2);
        setLateDeductionAmount(data.late_deduction_amount || 0);
        setLateDeductionType(data.late_deduction_type || 'fixed');
        setWeeklyHolidays(data.weekly_holidays || []);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
      toast.error('Failed to load attendance configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await policyApi.saveAttendancePolicy({
        office_start_time: officeStart,
        office_end_time: officeEnd,
        late_allow_minutes: lateAllow,
        grace_minutes: grace,
        max_late_allowed: maxLateAllowed,
        late_deduction_amount: lateDeductionAmount,
        late_deduction_type: lateDeductionType,
        weekly_holidays: weeklyHolidays
      });

      if (response.success) {
        toast.success('Attendance configuration saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving policy:', error);
      toast.error(error.message || 'Failed to save attendance configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const toggleHoliday = (day: string) => {
    setWeeklyHolidays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <Card className="glass shadow-none border-none rounded-none overflow-hidden relative">
      <CardHeader className="p-4 border-b border-white/5 bg-white/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="size-4 text-emerald-400" />
          Attendance Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="size-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading configuration...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Office Start</Label>
                <Input 
                  type="time" 
                  value={officeStart}
                  onChange={(e) => setOfficeStart(e.target.value)}
                  className="h-8 text-xs glass border-white/10" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Office End</Label>
                <Input 
                  type="time" 
                  value={officeEnd}
                  onChange={(e) => setOfficeEnd(e.target.value)}
                  className="h-8 text-xs glass border-white/10" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Late Allow (Min)</Label>
                <Input 
                  type="number" 
                  value={lateAllow}
                  onChange={(e) => setLateAllow(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs glass border-white/10" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Grace (Min)</Label>
                <Input 
                  type="number" 
                  value={grace}
                  onChange={(e) => setGrace(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs glass border-white/10" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="size-3 text-rose-400" />
                Late Deduction Rules
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Late Allowed (Per Month)</Label>
                  <Input 
                    type="number" 
                    value={maxLateAllowed}
                    onChange={(e) => setMaxLateAllowed(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs glass border-white/10" 
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Deduction Type</Label>
                  <select
                    value={lateDeductionType}
                    onChange={(e) => setLateDeductionType(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs glass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all"
                  >
                    <option value="fixed" className="bg-slate-900">Fixed Amount</option>
                    <option value="percentage" className="bg-slate-900">Percentage of Basic</option>
                    <option value="per_day" className="bg-slate-900">One Day Salary</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {lateDeductionType === 'fixed' ? 'Deduction Amount (৳)' : 
                     lateDeductionType === 'percentage' ? 'Deduction Percentage (%)' : 'Deduction Multiplier'}
                  </Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={lateDeductionAmount}
                    onChange={(e) => setLateDeductionAmount(parseFloat(e.target.value) || 0)}
                    disabled={lateDeductionType === 'per_day'}
                    className="h-8 text-xs glass border-white/10" 
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Weekly Holidays */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-3 text-emerald-400" />
                  Weekly Holidays
                </h3>
                <span className="text-[10px] text-muted-foreground/60">Click to toggle</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleHoliday(day)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-medium",
                      weeklyHolidays.includes(day)
                        ? "gradient-emerald text-white shadow-md shadow-emerald-500/10 border-emerald-500/30"
                        : "glass border-white/10 hover:border-emerald-500/20 text-muted-foreground"
                    )}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <AlertCircle className="size-3 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 leading-relaxed">
                Attendance timing and weekly holidays defined here will apply to all employees. Late entry policy will trigger salary deductions as per global settings.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchPolicy}
                disabled={saving}
                className="h-8 text-xs hover:bg-white/5"
              >
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="h-8 text-xs px-4 gradient-emerald shadow-lg shadow-emerald-500/10"
              >
                {saving ? (
                  <Loader2 className="size-3 mr-2 animate-spin" />
                ) : (
                  <Save className="size-3 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
