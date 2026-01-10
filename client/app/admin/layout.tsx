'use client';

import React from 'react';
import { AdminNav } from './_components/admin-nav';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login/admin');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50">
                <AdminNav />
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
                <div className="p-2">
                    {children}
                </div>
            </main>
        </div>
    );
}
