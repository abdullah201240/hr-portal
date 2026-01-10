'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Users, Mail, Lock, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Employee registration submitted');
    // Here you would typically handle the registration logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-500/30 to-indigo-500/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Users className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Register as Employee</CardTitle>
          <CardDescription className="text-purple-200">
            Create your employee account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="Enter your full name" 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="employee@example.com" 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Phone number" 
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
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-6 text-lg"
            >
              Register as Employee
            </Button>
            <div className="text-center text-purple-200 text-sm">
              Already have an account?{' '}
              <Link href="/login/employee" className="text-white underline hover:text-purple-300">
                Login as Employee
              </Link>
            </div>
            <div className="text-center text-purple-200 text-sm">
              <Link href="/register/company" className="text-white underline hover:text-purple-300">
                Register Company
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}