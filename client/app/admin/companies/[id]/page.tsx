'use client';

import React from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Building2,
    Settings,
    Shield,
    CreditCard,
    Users,
    Calendar,
    Globe,
    Mail,
    Phone,
    ArrowRight,
    ExternalLink,
    Lock,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
    // Mock data for a single company
    const company = {
        id: params.id,
        name: 'TechNova Inc.',
        industry: 'Software & Technology',
        website: 'https://technova.ai',
        email: 'contact@technova.ai',
        phone: '+1 (555) 123-4567',
        registeredDate: 'January 12, 2025',
        status: 'Active',
        plan: 'Enterprise',
        subscriptionStatus: 'Paid',
        nextBilling: 'Feb 12, 2026',
        adminName: 'Sarah Johnson',
        adminEmail: 'sarah.j@technova.ai',
        employeeCount: 124,
        modules: ['Payroll', 'Leave', 'Performance', 'Recruitment'],
        lastLogin: '2 hours ago'
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Back button and title */}
            <div className="space-y-4">
                <Link href="/admin/companies" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Companies
                </Link>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20">
                            <Building2 size={40} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold text-white">{company.name}</h1>
                                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-500/20">
                                    {company.status}
                                </span>
                            </div>
                            <p className="text-slate-400 mt-1 flex items-center gap-2">
                                {company.industry} • Since {company.registeredDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                            Edit Profile
                        </button>
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                            Manage License
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Box */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Employees', value: company.employeeCount, icon: Users, color: 'blue' },
                            { label: 'Plan', value: company.plan, icon: CreditCard, color: 'emerald' },
                            { label: 'Modules', value: company.modules.length, icon: Settings, color: 'purple' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
                                <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400 w-fit mb-3`}>
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                                <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Module Access */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Enabled Modules</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Payroll', 'Attendance', 'Leave Management', 'Performance', 'Recruitment', 'Asset Tracking'].map((mod) => {
                                const isEnabled = company.modules.includes(mod) || ['Attendance', 'Asset Tracking'].includes(mod) === false;
                                return (
                                    <div key={mod} className={`flex justify-between items-center p-4 rounded-xl border ${isEnabled ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
                                        <span className={`text-sm font-medium ${isEnabled ? 'text-emerald-300' : 'text-slate-500'}`}>{mod}</span>
                                        <button className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isEnabled ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-400'}`}>
                                            {isEnabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">System Events</h3>
                            <button className="text-emerald-400 text-xs hover:underline flex items-center gap-1">
                                View Full Log <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="space-y-5">
                            {[
                                { event: 'Billing successfully processed', time: '12 hours ago', icon: CreditCard },
                                { event: 'Admin role granted to Sarah Johnson', time: '1 day ago', icon: Shield },
                                { event: 'Employee threshold reached (100+)', time: '3 days ago', icon: Users },
                                { event: 'Company profile updated', time: '1 week ago', icon: Building2 },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400 shrink-0 mt-0.5">
                                        <log.icon size={14} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 text-sm font-medium">{log.event}</p>
                                        <p className="text-slate-500 text-[10px] mt-0.5 uppercase font-bold tracking-wider">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Info */}
                <div className="space-y-8">
                    {/* Contact Details */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Organization Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Globe size={18} className="text-emerald-500/60" />
                                <a href={company.website} target="_blank" className="text-sm hover:text-emerald-400 flex items-center gap-1">
                                    {company.website} <ExternalLink size={12} />
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Mail size={18} className="text-emerald-500/60" />
                                <span className="text-sm">{company.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Phone size={18} className="text-emerald-500/60" />
                                <span className="text-sm">{company.phone}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Primary Administrator</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                                    {company.adminName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{company.adminName}</p>
                                    <p className="text-xs text-slate-500">{company.adminEmail}</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={14} /> Send Message
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2">
                            <Lock size={18} /> Administrative Controls
                        </h3>
                        <p className="text-slate-500 text-xs mb-6">Restricted actions that affectcompany access.</p>
                        <div className="space-y-3">
                            <button className="w-full py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all">
                                Suspend Organization
                            </button>
                            <button className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all">
                                Force Password Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
