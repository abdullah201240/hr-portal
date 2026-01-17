'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Lock, MapPin, Phone, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { companyApi } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { companyRegistrationSchema } from '@/lib/validation/companySchema';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { toast } from 'sonner';


interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
}

export default function CompanyRegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { login } = useCompanyAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(companyRegistrationSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Prepare data for API call, removing undefined values for optional fields
      const { confirmPassword, ...apiData } = data;

      // Only include optional fields if they have values
      const payload: any = { ...apiData };
      if (!payload.phone) delete payload.phone;
      if (!payload.website) delete payload.website;
      if (!payload.description) delete payload.description;

      const result = await companyApi.createCompany(payload);

      if (result.success || result.data) {
        let token = '';
        let profile = null;

        // Extract token and profile from response
        if (result.token) {
          token = result.token;
        } else if (result.data && result.data.token) {
          token = result.data.token;
        }

        // Extract company profile if available
        if (result.data) {
          // If result.data is the company object itself
          if (result.data.id) {
            profile = result.data;
          } else if (result.data.data) {
            profile = result.data.data;
          }
        }

        if (token) {
          // Use the auth hook to handle login
          login(token, profile);
          toast.success('Registration successful! Redirecting to dashboard...');
          router.push('/company');
        } else {
          // Fallback if no token returned (shouldn't happen with our fix)
          toast.success('Registration successful! Please login.');
          router.push('/login/company');
        }
      }
    } catch (err: any) {
      // Handle API errors
      if (err.message && err.message.includes('Validation error')) {
        // Extract field-specific errors from the API response
        const errorMessages = err.message.split('; ');
        errorMessages.forEach((errorMessage: string) => {
          const [field, message] = errorMessage.split(': ');
          if (field && message) {
            setFormError(field as keyof FormData, { message });
          }
        });
        toast.error('Please fix the validation errors.');
      } else {
        setFormError('root', { message: err.message || 'An error occurred during registration' });
        toast.error(err.message || 'An error occurred during registration');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Register as Company</CardTitle>
          <CardDescription className="text-purple-200">
            Create your company account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            {errors.root && <div className="text-red-300 text-sm text-center mb-4">{errors.root.message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="name"
                      {...register('name')}
                      type="text"
                      placeholder="Enter company name"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="email"
                      {...register('email')}
                      type="email"
                      placeholder="company@example.com"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="phone"
                      {...register('phone')}
                      type="tel"
                      placeholder="Phone number"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="address"
                      {...register('address')}
                      type="text"
                      placeholder="Enter address"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.address ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="website"
                      {...register('website')}
                      type="url"
                      placeholder="https://company.com"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.website ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.website && <p className="text-red-400 text-sm mt-1">{errors.website.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="description"
                      {...register('description')}
                      type="text"
                      placeholder="Describe your company"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.description ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="password"
                      {...register('password')}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.password ? 'border-red-500' : ''}`}
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
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                    <Input
                      id="confirmPassword"
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register as Company'}
            </Button>
            <div className="text-center text-purple-200 text-sm">
              Already have an account?{' '}
              <Link href="/login/company" className="text-white underline hover:text-purple-300">
                Login as Company
              </Link>
            </div>
            <div className="text-center text-purple-200 text-sm">
              <Link href="/register/employee" className="text-white underline hover:text-purple-300">
                Register as Employee
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}