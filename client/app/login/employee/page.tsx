'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Users, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EmployeeLoginPage() {
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
      // Simulate employee login since there's no employee API endpoint yet
      // In a real implementation, this would call an employee login API
      
      // For demo purposes, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store a placeholder token for employee
      localStorage.setItem('authToken', 'employee_placeholder_token');
      
      // Show success notification
      toast.success('Welcome back! Redirecting to employee dashboard...');
      
      // Redirect to employee dashboard
      router.push('/employee');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during login');
      console.error('Employee login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-500/30 to-indigo-500/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Users className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Employee Login</CardTitle>
          <CardDescription className="text-purple-200">
            Access your employee dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="employee@example.com" 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400"
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-6 text-lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Employee'}
            </Button>
            <div className="text-center text-purple-200 text-sm">
              Don't have an account?{' '}
              <Link href="/register/employee" className="text-white underline hover:text-purple-300">
                Register as Employee
              </Link>
            </div>
            <div className="text-center text-purple-200 text-sm">
              <Link href="/login/company" className="text-white underline hover:text-purple-300">
                Login as Company
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}