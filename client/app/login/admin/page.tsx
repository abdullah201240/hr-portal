'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await adminApi.loginAdmin({ email, password });
            
            // The API now returns a token in the response
            // Response structure: { success: boolean, message: string, data: adminUserData, token: string }
            
            // Store the token returned by the API
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            } else {
                // Fallback: create a simple token if server doesn't return one
                const authToken = `admin_${result.data?.id || Date.now()}`;
                localStorage.setItem('authToken', authToken);
            }
            
            // Store admin profile data for use in other components
            if (result.data) {
                localStorage.setItem('adminProfile', JSON.stringify(result.data));
            }
            
            // Show success notification
            toast.success('Welcome back! Redirecting to admin dashboard...');
            
            // Redirect to admin dashboard
            router.push('/admin');
        } catch (err: any) {
            toast.error(err.message || 'Invalid credentials');
            console.error('Admin login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto bg-emerald-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Portal</h1>
                    <p className="text-muted-foreground mt-2">Secure access for platform administrators</p>
                </div>

                <Card className="backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-foreground">Sign In</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to manage the HRFlow SaaS platform
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">Admin Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@hrflow.com"
                                        className="pl-10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground">Password</Label>
                                    <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg group"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Enter Dashboard'}
                                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <div className="text-center">
                                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                                    Back to main site
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}