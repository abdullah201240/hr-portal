'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { companyApi } from '@/lib/api';
import { toast } from 'sonner';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';

export default function CompanyLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useCompanyAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await companyApi.loginCompany(formData);
      
      if (result.success || result.data) {
        let token = '';
        let profile = null;
        
        // Extract token and profile from response
        if (result.data && result.data.token) {
          token = result.data.token;
        } else if (result.token) {
          token = result.token;
        } else {
          // Fallback to placeholder token
          token = 'placeholder_token';
        }
        
        // Extract company profile if available
        if (result.data && result.data.company) {
          profile = result.data.company;
        } else if (result.company) {
          profile = result.company;
        }
        
        // Use the auth hook to handle login
        login(token, profile);
        
        // Show success notification
        toast.success('Welcome back! Redirecting to dashboard...');
        
        // Redirect to company dashboard after successful login
        router.push('/company'); // Redirect to company dashboard after login
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Company Login</CardTitle>
          <CardDescription className="text-purple-200">
            Access your company dashboard
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
                  placeholder="company@example.com" 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
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
          <CardFooter className="flex flex-col space-y-4 mt-8">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Company'}
            </Button>
            <div className="text-center text-purple-200 text-sm">
              Don't have an account?{' '}
              <Link href="/register/company" className="text-white underline hover:text-purple-300">
                Register Company
              </Link>
            </div>
            <div className="text-center text-purple-200 text-sm">
              <Link href="/login/employee" className="text-white underline hover:text-purple-300">
                Login as Employee
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}