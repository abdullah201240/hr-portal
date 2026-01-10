'use client';

'use client';

import React from 'react';
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
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

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

function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
    >
      <LogOut className="size-5" />
      <span className="font-medium">Sign Out</span>
    </button>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64 text-slate-300">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <ShieldCheck className="text-white size-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Admin<span className="text-emerald-500">Panel</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "hover:bg-slate-900 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "size-5 transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"
                )} />
                <span className="font-medium">{item.title}</span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                />
              )}
              <ChevronRight className={cn(
                "size-4 opacity-0 group-hover:opacity-100 transition-all",
                isActive ? "text-emerald-400 opacity-100" : "text-slate-500"
              )} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <LogoutButton />
      </div>
    </div>
  );
}
