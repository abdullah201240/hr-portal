'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function AdminFooter({ className }: { className?: string }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={cn(
            "border-t border-border glass-strong py-3 px-6 text-center z-40 transition-all duration-300",
            className
        )}>
            <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                    © {currentYear} <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Eidden</span> All rights reserved.
                </span>
            </div>
        </footer>
    );
}
