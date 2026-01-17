'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, UserX, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
    stats: {
        total: number;
        present: number;
        late: number;
        absent: number;
        onLeave: number;
    };
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Employees',
            value: stats.total.toString(),
            icon: Users,
            gradient: 'from-blue-500 to-indigo-500',
            bgGradient: 'from-blue-500/10 to-indigo-500/10',
            colorClass: 'border-blue-500/20 hover:border-blue-500/40',
            bgClass: 'from-blue-400 to-indigo-500',
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'from-blue-500/30 to-indigo-500/30',
            glowColor: 'from-blue-400 to-indigo-500',
            pulseColor: 'bg-blue-500/20'
        },
        {
            title: 'Present Today',
            value: stats.present.toString(),
            icon: UserCheck,
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            colorClass: 'border-emerald-500/20 hover:border-emerald-500/40',
            bgClass: 'from-emerald-400 to-teal-500',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'from-emerald-500/30 to-teal-500/30',
            glowColor: 'from-emerald-400 to-teal-500',
            pulseColor: 'bg-emerald-500/20'
        },
        {
            title: 'Late Arrivals',
            value: stats.late.toString(),
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            colorClass: 'border-amber-500/20 hover:border-amber-500/40',
            bgClass: 'from-amber-400 to-orange-500',
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBg: 'from-amber-500/30 to-orange-500/30',
            glowColor: 'from-amber-400 to-orange-500',
            pulseColor: 'bg-amber-500/20'
        },
        {
            title: 'Absent / On Leave',
            value: (stats.absent + stats.onLeave).toString(),
            icon: UserX,
            gradient: 'from-rose-500 to-pink-500',
            bgGradient: 'from-rose-500/10 to-pink-500/10',
            colorClass: 'border-rose-500/20 hover:border-rose-500/40',
            bgClass: 'from-rose-400 to-pink-500',
            iconColor: 'text-rose-600 dark:text-rose-400',
            iconBg: 'from-rose-500/30 to-pink-500/30',
            glowColor: 'from-rose-400 to-pink-500',
            pulseColor: 'bg-rose-500/20'
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {statCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className={cn(
                        "relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl border p-3 sm:p-4 md:p-6 transition-all duration-300 shadow-lg hover:shadow-2xl glass",
                        card.colorClass
                    )}
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150" />
                    <div className={cn("absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-10 blur-3xl", card.glowColor)} />

                    {/* Glow Effect */}
                    <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-10 bg-gradient-to-br", card.gradient)} />

                    <div className="relative z-10 flex flex-col gap-3 md:gap-4">
                        <div className="flex items-center justify-between">
                            <div className={cn("rounded-xl md:rounded-2xl bg-gradient-to-br p-2 md:p-3 shadow-inner", card.iconBg)}>
                                <card.icon className={cn("h-5 w-5 md:h-6 md:w-6", card.iconColor)} />
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-emerald-500" />
                                    <span className="hidden sm:inline">Live Update</span>
                                    <span className="sm:hidden">Live</span>
                                </div>
                                <div className={cn("h-1 w-8 md:w-12 rounded-full mt-1 bg-gradient-to-r", card.bgClass)} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs md:text-sm font-medium text-muted-foreground/80">
                                {card.title}
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent",
                                    card.bgClass
                                )}>
                                    {card.value}
                                </span>
                            </div>
                        </div>

                        {/* Decorative Mini-Graph Placeholder - Hidden on very small screens */}
                        <div className="hidden sm:flex items-end gap-1 h-6 md:h-8 mt-2 opacity-50">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    className={cn("flex-1 rounded-t-sm bg-gradient-to-t", card.bgClass)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pulse Animation Overlay */}
                    <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] animate-pulse opacity-50", card.bgClass)} />
                </motion.div>
            ))}
        </div>
    );
};
