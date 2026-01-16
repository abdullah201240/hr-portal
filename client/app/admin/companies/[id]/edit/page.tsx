'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companyApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
  name: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  established_date: string;
  status: string;
}

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    established_date: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const response = await companyApi.getCompanyById(Number(companyId));
        const company = response.data;
        
        setFormData({
          name: company.name || '',
          email: company.email || '',
          address: company.address || '',
          phone: company.phone || '',
          website: company.website || '',
          description: company.description || '',
          established_date: company.established_date || '',
          status: company.status || 'active'
        });
      } catch (error) {
        console.error('Error fetching company:', error);
        const errorMessage = (error as Error)?.message || 'Failed to fetch company details';
        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }


    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.phone && !/^([+]\d{1,3})?\d{4,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const companyData = formData;
      await companyApi.updateCompany(Number(companyId), companyData);
      toast.success('Company updated successfully');
      router.push(`/admin/companies/${companyId}`);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error((error as Error)?.message || 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {fetchError}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push('/admin/companies')} variant="outline">
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-none shadow-none rounded-none">
          <CardHeader className="border-none shadow-none rounded-none">
            <CardTitle className="text-xl">Edit Company</CardTitle>
          </CardHeader>
          <CardContent className="border-none shadow-none rounded-none">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className={`glass border-white/10 ${errors.name ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={`glass border-white/10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>


                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter company address"
                    className={`glass border-white/10 ${errors.address ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={`glass border-white/10 ${errors.phone ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                    className={`glass border-white/10 ${errors.website ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.website && <p className="text-red-400 text-sm">{errors.website}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established_date">Established Date</Label>
                  <Input
                    id="established_date"
                    name="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={handleChange}
                    className="glass border-white/10"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="glass border-white/10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter company description"
                  rows={3}
                  className={`w-full p-3 rounded-lg glass border-white/10 ${errors.description ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-6"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-6 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Updating...' : 'Update Company'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}