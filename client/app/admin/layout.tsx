'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from './_components/admin-nav';
import { AdminHeader } from './_components/admin-header';
import { AdminFooter } from './_components/admin-footer';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login/admin');
        }
    }, [isAuthenticated, isLoading, router]);

    // Close sidebar when resizing to mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="relative">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 gradient-emerald rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-1 relative z-10">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:flex md:flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
                >
                    <AdminNav
                        toggleSidebar={() => setSidebarOpen(false)}
                        isCollapsed={sidebarCollapsed}
                        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                </aside>

                <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                    {/* Header */}
                    <div className={`fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'md:left-16' : 'md:left-64'} left-0`}>
                        <div className="md:hidden flex items-center h-16 px-4 glass-strong border-b border-border">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="mr-2 rounded-xl glass hover:glass-strong"
                                aria-label="Toggle menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                                AdminPanel
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <AdminHeader />
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 p-0 md:p-6 pt-16 pb-20 animate-fade-in relative">
                        {children}
                    </main>

                    {/* Footer */}
                    <AdminFooter className={`fixed bottom-0 right-0 z-40 ${sidebarCollapsed ? 'md:left-16' : 'md:left-64'} left-0 transition-all duration-300`} />
                </div>
            </div>
        </div>
    );
}
