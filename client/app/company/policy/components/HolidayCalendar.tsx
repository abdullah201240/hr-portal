'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Trash2, Save, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { holidayApi, policyApi } from '@/lib/api';
import { toast } from 'sonner';

export function HolidayCalendar() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentDate.getFullYear()]); // Re-fetch if year changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const [holidayRes, policyRes] = await Promise.all([
        holidayApi.getHolidays(currentDate.getFullYear()),
        policyApi.getAttendancePolicy()
      ]);

      if (holidayRes.success) {
        setHolidays(holidayRes.data);
      }
      
      if (policyRes.success && policyRes.data) {
        setWeeklyHolidays(policyRes.data.weekly_holidays || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };
  
  // Calendar helper functions
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const existingHoliday = holidays.find(h => h.date === dateStr);
    if (existingHoliday) {
      setNewHoliday({ name: existingHoliday.name, date: dateStr });
      setIsOpen(true);
    } else {
      setNewHoliday({ name: '', date: dateStr });
      setIsOpen(true);
    }
  };

  const handleAddHoliday = async () => {
    if (newHoliday.name && newHoliday.date) {
      try {
        setSaving(true);
        const response = await holidayApi.saveHoliday({
          name: newHoliday.name,
          date: newHoliday.date
        });

        if (response.success) {
          toast.success(holidays.find(h => h.date === newHoliday.date) ? 'Holiday updated' : 'Holiday added');
          fetchData();
          setNewHoliday({ name: '', date: '' });
          setIsOpen(false);
        }
      } catch (error: any) {
        console.error('Error saving holiday:', error);
        toast.error(error.message || 'Failed to save holiday');
      } finally {
        setSaving(false);
      }
    }
  };
  
  const handleDeleteHoliday = async (id: number) => {
    try {
      setSaving(true);
      const response = await holidayApi.deleteHoliday(id);
      if (response.success) {
        toast.success('Holiday deleted');
        fetchData();
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      toast.error(error.message || 'Failed to delete holiday');
    } finally {
      setSaving(false);
    }
  };

  const isHoliday = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const isWeeklyHoliday = (day: number) => {
    const d = new Date(year, currentDate.getMonth(), day);
    const dayName = d.toLocaleString('default', { weekday: 'long' });
    return weeklyHolidays.includes(dayName);
  };

  return (
    <Card className="glass shadow-none border-none rounded-none overflow-hidden">
      <CardHeader className="p-1.5 shadow-none border-none rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-emerald-400" />
              Holiday Calendar
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-emerald-400 mr-1">{monthName} {year}</h3>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="size-7 glass border-white/10"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 glass border-white/10 text-[10px]"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="size-7 glass border-white/10"
                onClick={nextMonth}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="size-8 text-emerald-500 animate-spin" />
            <p className="text-xs text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground">
          <p>Click date to manage</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-emerald-500/40" />
              <span>Public Holiday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-rose-500/20" />
              <span>Weekend</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full border border-white/20" />
              <span>Work Day</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[9px] font-bold py-0.5 text-muted-foreground/60 uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map(i => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const holiday = isHoliday(day);
            const weekend = isWeeklyHoliday(day);
            const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString();
            
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "aspect-square p-1 rounded-md border transition-all duration-200 flex flex-col items-center justify-center relative group overflow-hidden",
                  holiday 
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" 
                    : weekend
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400/80"
                    : "glass border-white/5 hover:border-emerald-500/20 text-foreground",
                  isToday && !holiday && !weekend && "border-blue-500/50 bg-blue-500/5"
                )}
              >
                <span className={cn(
                  "text-[10px] font-semibold",
                  isToday && "text-blue-400",
                  weekend && !holiday && "text-rose-400/80"
                )}>{day}</span>
                {holiday && (
                  <div className="absolute inset-x-0 bottom-0 bg-emerald-500/20 py-0">
                    <p className="text-[6px] truncate px-0.5 text-center font-bold">
                      {holiday.name}
                    </p>
                  </div>
                )}
                {weekend && !holiday && (
                  <div className="absolute inset-x-0 bottom-0 bg-rose-500/5 py-0">
                    <p className="text-[6px] truncate px-0.5 text-center font-bold opacity-40">
                      Weekend
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>



        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="glass border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-emerald-400" />
                {holidays.find(h => h.date === newHoliday.date) ? 'Edit Holiday' : 'Add New Holiday'}
              </DialogTitle>
              <DialogDescription>
                {newHoliday.date ? new Date(newHoliday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  placeholder="e.g. Eid-ul-Fitr"
                  className="glass border-white/10"
                  autoFocus
                  disabled={saving}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center w-full gap-2">
              {holidays.find(h => h.date === newHoliday.date) && (
                <Button 
                  variant="ghost" 
                  disabled={saving}
                  onClick={() => {
                    const h = holidays.find(h => h.date === newHoliday.date);
                    if (h) handleDeleteHoliday(h.id);
                  }}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 mr-auto"
                >
                  {saving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-2" />
                  )}
                  Remove
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                  className="glass border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddHoliday}
                  disabled={!newHoliday.name || saving}
                  className="gradient-emerald shadow-lg shadow-emerald-500/20"
                >
                  {saving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  {holidays.find(h => h.date === newHoliday.date) ? 'Update' : 'Add'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
