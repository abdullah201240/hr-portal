'use client';

import { cn } from '@/lib/utils';

export function CompanyFooter({ className }: { className?: string }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={cn(
            " glass-strong py-3 px-6 text-center z-40 transition-all duration-300",
            className
        )}>
            <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                    © {currentYear} <span className="font-bold bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">HRFlow</span> All rights reserved.
                </span>
            </div>
        </footer>
    );
}
