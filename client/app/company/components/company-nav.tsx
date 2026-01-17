'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Settings,
  ChevronRight,
  Users,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  {
    title: 'Dashboard',
    href: '/company',
    icon: LayoutDashboard,
  },
  {
    title: 'My Company',
    href: '/company/profile',
    icon: Building2,
  },
  {
    title: 'Departments',
    href: '/company/departments',
    icon: Building2,
  },
  {
    title: 'Designations',
    href: '/company/designations',
    icon: Users,
  },
  {
    title: 'Employees',
    href: '/company/employees',
    icon: Users,
  },
  {
    title: 'Hierarchy',
    href: '/company/employees/hierarchy',
    icon: Users,
  },
  {
    title: 'Policy',
    href: '/company/policy',
    icon: ShieldCheck,
  },
  {
    title: 'Analytics',
    href: '/company/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/company/settings',
    icon: Settings,
  },
];

type CompanyNavProps = {
  toggleSidebar?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
};

export function CompanyNav({ toggleSidebar, isCollapsed, toggleCollapse }: CompanyNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleClick = (href: string) => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full relative overflow-hidden transition-all duration-300 custom-scrollbar",
      "glass-strong border-r border-border",
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />

      {/* Logo Section */}
      <div className={cn(
        "relative p-6 border-b border-emerald-500/10",
        isCollapsed && "p-4"
      )}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/company"
              className="flex items-center justify-center"
              onClick={() => toggleSidebar && toggleSidebar()}
            >
              <div className="gradient-emerald p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                <Building2 className="text-white size-6" />
              </div>
            </Link>
            
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-emerald-500/5 text-emerald-500/60 hover:text-emerald-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Link
              href="/company"
              className="flex items-center gap-3 group"
              onClick={() => toggleSidebar && toggleSidebar()}
            >
              <div className="gradient-emerald p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="text-white size-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight">
                HR Portal
              </span>
            </Link>

            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-emerald-500/5 text-emerald-500/60 hover:text-emerald-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 17-5-5 5-5" />
                <path d="m11 17-5-5 5-5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 relative custom-scrollbar">
        {/* Nav Group: Main */}
        <div className="space-y-1">
          
          {navItems.slice(0, 4).map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => handleClick(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isCollapsed && 'justify-center px-3',
                    isActive
                      ? "bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "hover:bg-emerald-500/5 text-muted-foreground hover:text-emerald-600"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-emerald-500/5 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <item.icon className={cn(
                    "size-5 shrink-0 transition-colors",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-emerald-500"
                  )} />

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium relative z-10 whitespace-nowrap text-sm"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && (
                    <ChevronRight className={cn(
                      "size-4 ml-auto opacity-0 group-hover:opacity-100 transition-all relative z-10",
                      isActive ? "text-emerald-600 dark:text-emerald-400 opacity-100" : "text-muted-foreground"
                    )} />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Nav Group: System */}
        <div className="space-y-1">
          
          {navItems.slice(4).map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 4) * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => handleClick(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isCollapsed && 'justify-center px-3',
                    isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "hover:bg-emerald-500/5 text-muted-foreground hover:text-emerald-600"
                  )}
                >
                  <item.icon className={cn(
                    "size-5 shrink-0",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.title}</span>}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

     
    </div>
  );
}