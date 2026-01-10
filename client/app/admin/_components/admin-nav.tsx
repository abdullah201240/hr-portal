'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Users2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Companies',
    href: '/admin/companies',
    icon: Building2,
  },
  {
    title: 'Admin Management',
    href: '/admin/admins',
    icon: ShieldCheck,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users2,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

function LogoutButton({ isCollapsed }: { isCollapsed?: boolean }) {
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-3 px-3 py-3 w-full rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group",
        isCollapsed && "justify-center"
      )}
      title={isCollapsed ? "Sign Out" : undefined}
    >
      <LogOut className="size-5 group-hover:rotate-12 transition-transform duration-200" />
      {!isCollapsed && <span className="font-medium">Sign Out</span>}
    </button>
  );
}

type AdminNavProps = {
  toggleSidebar?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
};

export function AdminNav({ toggleSidebar, isCollapsed, toggleCollapse }: AdminNavProps) {
  const pathname = usePathname();

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
        "relative p-6 border-b border-border",
        isCollapsed && "p-4"
      )}>
        {isCollapsed ? (
          // Collapsed state - show only logo and toggle button stacked vertically
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center justify-center"
              onClick={() => toggleSidebar && toggleSidebar()}
            >
              <motion.div
                className="gradient-emerald p-2.5 rounded-xl shadow-lg glow-emerald"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheck className="text-white size-6" />
              </motion.div>
            </Link>

            {/* Collapse Toggle Button - Always visible */}
            <motion.button
              onClick={toggleCollapse}
              className="p-2 rounded-lg glass hover:glass-strong transition-all duration-200 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </motion.button>
          </div>
        ) : (
          // Expanded state - show logo, text, and toggle button horizontally
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 group px-2"
              onClick={() => toggleSidebar && toggleSidebar()}
            >
              <motion.div
                className="gradient-emerald p-2.5 rounded-xl shadow-lg glow-emerald"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheck className="text-white size-6" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  AdminPanel
                </span>
              </motion.div>
            </Link>

            {/* Collapse Toggle Button */}
            <motion.button
              onClick={toggleCollapse}
              className="p-2 rounded-lg glass hover:glass-strong transition-all duration-200 group shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 group-hover:-translate-x-0.5 transition-transform">
                <path d="m18 17-5-5 5-5" />
                <path d="m11 17-5-5 5-5" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 relative">
        {navItems.map((item, index) => {
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
                    ? "bg-emerald-500/10 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-lg dark:glow-emerald"
                    : "hover:bg-emerald-500/5 dark:hover:bg-white/5 text-muted-foreground hover:text-emerald-600 dark:hover:text-foreground"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative z-10"
                >
                  <item.icon className={cn(
                    "size-5 transition-colors",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                  )} />
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium relative z-10 whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Chevron */}
                {!isCollapsed && (
                  <ChevronRight className={cn(
                    "size-4 ml-auto opacity-0 group-hover:opacity-100 transition-all relative z-10",
                    isActive ? "text-emerald-600 dark:text-emerald-400 opacity-100" : "text-muted-foreground"
                  )} />
                )}

                {/* Collapsed Active Indicator */}
                {isCollapsed && isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="relative p-2 border-t border-border">
        {/* Logout Button */}
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
