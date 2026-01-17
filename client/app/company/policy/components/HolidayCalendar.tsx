'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Trash2, Save, Loader2, Plus} from 'lucide-react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { holidayApi, policyApi } from '@/lib/api';
import { toast } from 'sonner';

const localizer = momentLocalizer(moment);

export function HolidayCalendar() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  
  const [isOpen, setIsOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: ''
  });
  const [selectedHoliday, setSelectedHoliday] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [currentDate.getFullYear()]);

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

  // Transform holidays for react-big-calendar
  const events = useMemo(() => {
    return holidays.map(holiday => ({
      id: holiday.id,
      title: holiday.name,
      start: new Date(holiday.date + 'T00:00:00'),
      end: new Date(holiday.date + 'T23:59:59'),
      allDay: true,
      resource: holiday
    }));
  }, [holidays]);

  const handleSelectSlot = ({ start }: any) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    const existingHoliday = holidays.find(h => h.date === dateStr);
    
    if (existingHoliday) {
      setSelectedHoliday(existingHoliday);
      setNewHoliday({ name: existingHoliday.name, date: dateStr });
    } else {
      setSelectedHoliday(null);
      setNewHoliday({ name: '', date: dateStr });
    }
    setIsOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedHoliday(event.resource);
    setNewHoliday({ name: event.title, date: event.resource.date });
    setIsOpen(true);
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
          toast.success(selectedHoliday ? 'Holiday updated' : 'Holiday added');
          fetchData();
          setNewHoliday({ name: '', date: '' });
          setSelectedHoliday(null);
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
        setSelectedHoliday(null);
      }
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      toast.error(error.message || 'Failed to delete holiday');
    } finally {
      setSaving(false);
    }
  };

  // Custom day cell wrapper to highlight weekends
  const dayPropGetter = (date: Date) => {
    const dayName = moment(date).format('dddd');
    const isWeekend = weeklyHolidays.includes(dayName);
    const dateStr = moment(date).format('YYYY-MM-DD');
    const hasHoliday = holidays.some(h => h.date === dateStr);
    
    return {
      className: cn(
        'text-gray-800 dark:text-gray-200',
        isWeekend && !hasHoliday && 'weekend-day bg-blue-50 dark:bg-blue-900/30',
        hasHoliday && 'holiday-day bg-green-50 dark:bg-green-900/30',
        !isWeekend && !hasHoliday && 'bg-white dark:bg-gray-800'
      ),
      style: {}
    };
  };

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: '#10B981', // Tailwind green-500
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '2px 4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    };
  };

  return (
    <Card className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm dark:border-gray-700">
      <CardHeader className="p-4 pb-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-xl flex items-center gap-2 dark:text-gray-200">
            <CalendarDays className="size-5 dark:text-blue-400" />
            Holiday Calendar
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-green-500 dark:bg-green-600" />
                <span className="text-muted-foreground dark:text-gray-400">Public Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-red-500/30 dark:bg-red-600/30" />
                <span className="text-muted-foreground dark:text-gray-400">Weekend</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                setNewHoliday({ name: '', date: moment().format('YYYY-MM-DD') });
                setSelectedHoliday(null);
                setIsOpen(true);
              }}
              size="sm"
              className="min-w-[100px] bg-blue-600  hover:bg-blue-700 text-white"
            >
              <Plus className="size-4 mr-1.5 dark:text-white" />
               Add Holiday
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 dark:bg-gray-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="size-8 text-primary animate-spin dark:text-blue-400" />
            <p className="text-sm text-muted-foreground dark:text-gray-400">Loading calendar...</p>
          </div>
        ) : (
          <div className="calendar-wrapper dark:text-gray-200">
            <style jsx>{`
              .rbc-calendar {
                font-family: inherit;
              }
              
              .rbc-header {
                padding: 8px 4px;
                font-weight: 600;
                font-size: 0.875rem;
                border-bottom-width: 1px;
              }
              
              .rbc-header,
              .rbc-toolbar,
              .rbc-month-view,
              .rbc-toolbar button {
                @apply dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200;
              }
              
              .rbc-month-view {
                border-radius: 8px;
                overflow: hidden;
              }
              
              .rbc-date-cell {
                padding: 4px;
                text-align: center;
              }
              
              .rbc-day-bg {
                @apply dark:border-gray-700;
              }
              
              .rbc-off-range-bg {
                @apply dark:bg-gray-900;
              }
              
              .rbc-button-link {
                font-weight: 500;
                font-size: 0.875rem;
              }
              
              .rbc-today {
                position: relative;
                background-color: #2563eb !important; /* blue-600 */
                border: 2px solid #60a5fa !important; /* blue-400 border */
                box-shadow: 0 0 0 1px white inset !important;
                @apply dark:bg-blue-600 dark:border-blue-400 !important;

              }
              
              .rbc-today .rbc-button-link {
                font-weight: 700;
                color: white !important;
                @apply dark:text-white !important;
              }
              
              .rbc-today.rbc-off-range .rbc-button-link {
                color: rgba(255, 255, 255, 0.7) !important;
              }
              
              .rbc-today {
                @apply dark:bg-blue-600 dark:border-blue-400 !important;
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
              }
              
              .rbc-today .rbc-button-link {
                @apply dark:text-white !important;
              }
              
              .weekend-day {
                /* This class will be styled with Tailwind utilities */
              }
              
              .holiday-day {
                /* This class will be styled with Tailwind utilities */
              }
              
              .rbc-off-range {
                opacity: 0.3;
              }
              
              .rbc-event {
                cursor: pointer;
                transition: all 0.2s;
              }
              
              .rbc-event:hover {
                opacity: 1 !important;
                transform: scale(1.02);
              }
              
              .rbc-month-row {
                min-height: 60px;
              }
              
              .rbc-toolbar {
                padding: 12px;
                margin-bottom: 12px;
                border-radius: 8px;
              }
              
              .rbc-toolbar button {
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.875rem;
                transition: all 0.2s;
                border: 1px solid;
              }
              
              .rbc-toolbar button:hover {
                transition: all 0.2s;
              }
              
              .rbc-toolbar button.rbc-active {
                border-color: hsl(var(--primary));
              }
              
              .rbc-toolbar-label {
                font-weight: 700;
                font-size: 1rem;
              }
            `}</style>
            
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              popup
              date={currentDate}
              onNavigate={setCurrentDate}
              view={view}
              onView={(view: any) => setView(view)}
              views={[Views.MONTH]}
              dayPropGetter={dayPropGetter}
              eventPropGetter={eventStyleGetter}
              tooltipAccessor={(event: { title: any; }) => event.title}
              className="rounded-lg bg-background dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md border rounded-lg bg-background text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-gray-200">
                <CalendarDays className="size-5 dark:text-blue-400" />
                {selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {newHoliday.date ? moment(newHoliday.date).format('dddd, MMMM D, YYYY') : 'Select a date'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name" className="dark:text-gray-300">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  placeholder="e.g. Eid-ul-Fitr, Independence Day"
                  className="border rounded-md dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  autoFocus
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holiday-date" className="dark:text-gray-300">Date</Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="border rounded-md dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  disabled={saving}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 pt-4">
              {selectedHoliday && (
                <Button 
                  variant="outline" 
                  disabled={saving}
                  onClick={() => handleDeleteHoliday(selectedHoliday.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:mr-auto mb-2 sm:mb-0 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {saving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedHoliday(null);
                  }}
                  disabled={saving}
                  className="w-full sm:w-auto dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddHoliday}
                  disabled={!newHoliday.name || !newHoliday.date || saving}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {saving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  {selectedHoliday ? 'Update' : 'Add'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}