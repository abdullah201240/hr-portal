'use client';

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function EditAdmin(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'admin',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const adminId = params?.id as string;

  useEffect(() => {
    if (!params?.id) return;

    const fetchAdminDetails = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const response = await adminApi.getAdminById(Number(adminId));
        const admin = response.data;
        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          role: admin.role || 'admin',
          status: admin.status || 'active'
        });
      } catch (error: any) {
        console.error('Error fetching admin details:', error);
        const errorMessage = error.message || 'Failed to fetch admin details';
        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminDetails();
  }, [params.id]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'role' || name === 'status') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user selects an option
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
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const adminData = formData;
      await adminApi.updateAdmin(Number(adminId), adminData);
      toast.success('Admin updated successfully');
      router.push('/admin/admins');
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="text-muted-foreground">Loading admin details...</p>
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
          <Button onClick={() => router.push('/admin/admins')} variant="outline">
            Back to Admins
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
            <CardTitle className="text-xl">Edit Admin</CardTitle>
          </CardHeader>
          <CardContent className="border-none shadow-none rounded-none">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
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

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="glass border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                  type="submit"
                  className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Updating...' : 'Update Admin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}