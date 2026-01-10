'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, MapPin, Phone, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { companyApi } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema for editing company (without password)
const companyEditSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  address: z.string().min(1, 'Address is required'),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => {
        if (!val) return true; // Allow undefined values
        return /^\+?\d{1,3}\d{4,15}$/.test(val);
      },
      {
        message: 'Invalid phone number format',
      }
    ),
  website: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => {
        if (!val) return true; // Allow undefined values
        const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlRegex.test(val);
      },
      {
        message: 'Invalid website URL',
      }
    ),
  description: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export type CompanyEditData = z.infer<typeof companyEditSchema>;

interface FormData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
}

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = React.useState(false);
  const [companyData, setCompanyData] = React.useState<FormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(companyEditSchema),
  });

  React.useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await companyApi.getCompanyById(Number(params.id));
        const company = response.data;
        
        // Set form values
        setValue('name', company.name);
        setValue('email', company.email);
        setValue('address', company.address);
        setValue('phone', company.phone || '');
        setValue('website', company.website || '');
        setValue('description', company.description || '');
        
        setCompanyData({
          name: company.name,
          email: company.email,
          address: company.address,
          phone: company.phone || '',
          website: company.website || '',
          description: company.description || '',
        });
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };

    fetchCompany();
  }, [params.id, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Prepare data for API call, removing undefined values for optional fields
      const payload: any = { ...data };
      if (!payload.phone) delete payload.phone;
      if (!payload.website) delete payload.website;
      if (!payload.description) delete payload.description;
      
      const result = await companyApi.updateCompany(Number(params.id), payload);
      
      if (result.data) {
        router.push(`/admin/companies/${params.id}`);
      }
    } catch (err: any) {
      // Handle API errors
      if (err.message.includes('Validation error')) {
        // Extract field-specific errors from the API response
        const errorMessages = err.message.split('; ');
        errorMessages.forEach((errorMessage: string) => {
          const [field, message] = errorMessage.split(': ');
          if (field && message) {
            setFormError(field as keyof FormData, { message });
          }
        });
      } else {
        setFormError('root', { message: err.message || 'An error occurred during update' });
      }
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Edit Company</CardTitle>
          <CardDescription className="text-purple-200">
            Update company information
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex gap-4 w-full">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Company'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 py-6 text-lg"
                onClick={() => router.push(`/admin/companies/${params.id}`)}
              >
                Cancel
              </Button>
            </div>
            <div className="text-center text-purple-200 text-sm">
              <Link href="/admin/companies" className="text-white underline hover:text-purple-300">
                Back to Companies List
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}