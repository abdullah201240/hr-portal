'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceConfig } from './AttendanceConfig';
import { HolidayCalendar } from './HolidayCalendar';
import { LeavePolicy } from './LeavePolicy';

const TABS = [
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'holiday', label: 'Holiday', icon: Calendar },
  { id: 'leave', label: 'Leave', icon: Plane },
];

export function PolicyTabs() {
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    // Load active tab from localStorage on component mount
    const savedTab = localStorage.getItem('policyActiveTab');
    if (savedTab && TABS.some(tab => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Save active tab to localStorage
    localStorage.setItem('policyActiveTab', tabId);
  };

  return (
    <div className="space-y-2">
      

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1.5 bg-muted backdrop-blur-sm rounded-xl w-fit border border-white/5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive ? "text-white" : "text-muted-foreground hover:text-emerald-500"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 gradient-emerald shadow-lg shadow-emerald-500/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn("size-4 relative z-10", isActive ? "text-white" : "group-hover:text-emerald-500")} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'attendance' && <AttendanceConfig />}
        {activeTab === 'holiday' && <HolidayCalendar />}
        {activeTab === 'leave' && <LeavePolicy />}
      </motion.div>
    </div>
  );
}
