'use client';

import { Moon, Sun, Search, User, Settings, LogOut, Bell, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const { logout, adminProfile } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('adminProfile');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed, redirecting...');
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminProfile');
        router.push('/login/admin');
      }, 1000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    if (searchQuery) {
      toast.info(`Searching for: ${searchQuery}`);
    }
  };

  const goToProfile = () => {
    router.push('/admin/profile');
  };

  const goToSettings = () => {
    router.push('/admin/settings');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-strong">
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="flex h-16 items-center justify-between px-6 w-full">
        {/* Left section with search */}
        <div className="flex items-center space-x-4 flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              name="search"
              type="text"
              placeholder="Search anything..."
              className="pl-11 pr-4 py-2.5 w-full rounded-xl border border-white/10 glass focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all placeholder:text-muted-foreground/60"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-lg border border-white/10 bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </form>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="relative rounded-xl glass hover:glass-strong transition-all"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl glass hover:glass-strong transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </Button>
          </motion.div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="relative h-10 rounded-xl glass hover:glass-strong px-3 gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center text-white font-semibold shadow-lg glow-emerald">
                    {getInitials(adminProfile?.name)}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{adminProfile?.name || 'Administrator'}</span>
                    <span className="text-xs text-muted-foreground leading-none mt-1">Admin</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-background bg-emerald-500"></span>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 glass-strong border-white/10 p-0 overflow-hidden">
              {/* Profile Header */}
              <div className="relative p-2 border-b border-white/10 gradient-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center text-white font-bold shadow-lg glow-emerald">
                    {getInitials(adminProfile?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {adminProfile?.name || 'Administrator'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {adminProfile?.email || 'admin@hrportal.com'}
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-[10px] gradient-emerald-subtle border-emerald-500/20">
                      Super Admin
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5">
                <DropdownMenuItem
                  onSelect={goToProfile}
                  className="cursor-pointer flex items-center gap-3 py-2.5 px-3 rounded-lg hover:glass transition-all"
                >
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile</p>
                    <p className="text-xs text-muted-foreground">View your profile</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={goToSettings}
                  className="cursor-pointer flex items-center gap-3 py-2.5 px-3 rounded-lg hover:glass transition-all"
                >
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Settings</p>
                    <p className="text-xs text-muted-foreground">Manage preferences</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-white/10" />

                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-red-500/10 text-red-500 focus:text-red-500 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sign out</p>
                    <p className="text-xs opacity-70">Logout from admin panel</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}