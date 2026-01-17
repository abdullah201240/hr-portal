'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/api';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building,
    CreditCard,
    BadgeCheck,
    Smartphone,
    Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Employee, EmployeeFormData } from '@/types/employee';

export default function EmployeeProfilePage() {
    const { isAuthenticated, isLoading, employeeProfile } = useEmployeeAuth();


    const router = useRouter();
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<Partial<EmployeeFormData>>({});
    const [loading, setLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Since we don't have editing capabilities for ALL fields (like salary, designation) usually, 
    // we will display them as Read-Only and only allow editing contact info maybe?
    // User asked for "see there profile", so read-only is primary. I will add edit for personal details.

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login/employee');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (profileLoaded) return;

            try {
                if (employeeProfile) {
                    setEmployeeData(employeeProfile);
                    setFormData({
                        name: employeeProfile.name,
                        email: employeeProfile.email,
                        phone: employeeProfile.phone,
                        currentAddress: employeeProfile.currentAddress,
                        personalMobile: employeeProfile.personalMobile,
                        emergencyContactNumber: employeeProfile.emergencyContactNumber,
                        dob: employeeProfile.dob,
                        bloodGroup: employeeProfile.bloodGroup,
                        gender: employeeProfile.gender,
                        maritalStatus: employeeProfile.maritalStatus,
                        image: employeeProfile.image
                    });
                    setProfileLoaded(true);
                }

                // Always fetch fresh data to be sure
                const response = await employeeApi.getProfile();
                if (response.success) {
                    setEmployeeData(response.data);
                    // Update local storage if needed
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('employeeProfile', JSON.stringify(response.data));
                    }
                    setFormData({
                        name: response.data.name,
                        email: response.data.email,
                        phone: response.data.phone,
                        currentAddress: response.data.currentAddress,
                        personalMobile: response.data.personalMobile,
                        emergencyContactNumber: response.data.emergencyContactNumber,
                        dob: response.data.dob,
                        bloodGroup: response.data.bloodGroup,
                        gender: response.data.gender,
                        maritalStatus: response.data.maritalStatus,
                        image: response.data.image
                    });
                    setProfileLoaded(true);
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, employeeProfile, profileLoaded]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!employeeData) return null;

    return (
        <div >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    My Profile
                </h1>
                <p className="text-muted-foreground mt-1">
                    View and manage your personal information
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: ID Card Style */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <Card className="glass border-emerald-500/20 shadow-lg overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-90"></div>
                        <CardContent className="pt-12 relative flex flex-col items-center text-center pb-8">
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden bg-white">
                                    {employeeData.image ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE || ''}${employeeData.image}`}
                                            alt={employeeData.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.name)}&background=10b981&color=fff`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-3xl font-bold">
                                            {employeeData.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-2 border-4 border-white dark:border-zinc-900">
                                    <BadgeCheck className="w-4 h-4" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-foreground">{employeeData.name}</h2>
                            <p className="text-muted-foreground font-medium">{employeeData.designation || 'Employee'}</p>

                            <div className="mt-6 w-full space-y-3">
                                <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee ID</span>
                                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{employeeData.employeeId}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</span>
                                    <span className="font-bold">{employeeData.department || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${employeeData.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {employeeData.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Personal Information */}
                    <Card className="glass border-emerald-500/10 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-500" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Email Address</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Mail className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.email}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Phone Number</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Phone className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.phone || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Address</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.currentAddress || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Date of Birth</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.dob ? new Date(employeeData.dob).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Gender</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <User className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.gender || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Blood Group</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className="text-red-500 font-bold">🩸</span>
                                    {employeeData.bloodGroup || 'N/A'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
                    <Card className="glass border-emerald-500/10 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                Employment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Joining Date</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Employment Type</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <BadgeCheck className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.employeeType || 'Full Time'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Office Contact</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Smartphone className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.personalMobile || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Emergency Contact</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Phone className="w-4 h-4 text-red-400" />
                                    {employeeData.emergencyContactNumber || 'N/A'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Info (Hidden or minimal for privacy/security usually, but showing bank generic info is fine) */}
                    <Card className="glass border-emerald-500/10 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-500" />
                                Financial Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Bank Name</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Building className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.bankName || 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Account Number</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="w-4 h-4 text-emerald-500/70" />
                                    {employeeData.accountNumber ? '••••' + employeeData.accountNumber.slice(-4) : 'N/A'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </motion.div>
            </div>
        </div>
    );
}
