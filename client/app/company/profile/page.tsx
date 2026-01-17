'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { companyApi } from '@/lib/api';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Company } from '@/types/company';

export default function CompanyProfilePage() {
  const { isAuthenticated, isLoading, companyProfile, setCompanyProfile } = useCompanyAuth();
  const router = useRouter();
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    industry: '',
    founded_year: '',
    employee_count: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to access your profile.');
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  // Track if profile has been loaded to prevent re-fetching
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (profileLoaded) return; // Prevent re-fetching
      
      try {
        console.log('Fetching company profile...');
        console.log('companyProfile from auth hook:', companyProfile);
        
        // Try to get company profile from auth hook first
        if (companyProfile) {
          console.log('Using company profile from auth hook:', companyProfile);
          // Handle both direct object and response object with data property
          const companyDataObj = companyProfile.data || companyProfile;
          setCompanyData(companyDataObj);
          setFormData({
            name: companyDataObj.name || '',
            email: companyDataObj.email || '',
            phone: companyDataObj.phone || '',
            website: companyDataObj.website || '',
            address: companyDataObj.address || '',
            description: companyDataObj.description || '',
            industry: companyDataObj.industry || companyDataObj.sector || companyDataObj.category || companyDataObj.business_type || '',
            founded_year: companyDataObj.founded_year || companyDataObj.established_date || companyDataObj.founded || companyDataObj.established || '',
            employee_count: companyDataObj.employee_count || companyDataObj.size || companyDataObj.employees || companyDataObj.staff_count || '',
            logo: companyDataObj.logo || ''
          });
          setProfileLoaded(true);
        } else {
          // Fallback to API call if profile not in auth hook
          console.log('Fetching company profile from API...');
          const response = await companyApi.getCurrentCompanyProfile();
          console.log('API response:', response);
          
          if (response.success && response.data) {
            // The API returns the company data, possibly nested in response.data
            const company = response.data;
            console.log('Received company data from API:', company);
            // Handle both direct object and response object with data property
            const companyDataObj = company.data || company;
            setCompanyData(companyDataObj);
            setCompanyProfile(companyDataObj); // Update the auth hook with the fetched profile
            setFormData({
              name: companyDataObj.name || '',
              email: companyDataObj.email || '',
              phone: companyDataObj.phone || '',
              website: companyDataObj.website || '',
              address: companyDataObj.address || '',
              description: companyDataObj.description || '',
              industry: companyDataObj.industry || companyDataObj.sector || companyDataObj.category || companyDataObj.business_type || '',
              founded_year: companyDataObj.founded_year || companyDataObj.established_date || companyDataObj.founded || companyDataObj.established || '',
              employee_count: companyDataObj.employee_count || companyDataObj.size || companyDataObj.employees || companyDataObj.staff_count || '',
              logo: companyDataObj.logo || ''
            });
            setProfileLoaded(true);
          } else {
            console.warn('Could not fetch company profile:', response);
            // Still try to use whatever data we have
            const company = response.data || {};
            // Handle both direct object and response object with data property
            const companyDataObj = company.data || company;
            setCompanyData(companyDataObj);
            setFormData({
              name: companyDataObj.name || '',
              email: companyDataObj.email || '',
              phone: companyDataObj.phone || '',
              website: companyDataObj.website || '',
              address: companyDataObj.address || '',
              description: companyDataObj.description || '',
              industry: companyDataObj.industry || companyDataObj.sector || companyDataObj.category || companyDataObj.business_type || '',
              founded_year: companyDataObj.founded_year || companyDataObj.established_date || companyDataObj.founded || companyDataObj.established || '',
              employee_count: companyDataObj.employee_count || companyDataObj.size || companyDataObj.employees || companyDataObj.staff_count || '',
              logo: companyDataObj.logo || ''
            });
            setProfileLoaded(true);
          }
        }
      } catch (error: unknown) {
        console.error('Error fetching company profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load company profile';
        toast.error(errorMessage);
        setProfileLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !profileLoaded) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, companyProfile, setCompanyProfile, profileLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/companies/upload-logo`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't include Content-Type header when using FormData
          // The browser will set it with the proper boundary
          'Authorization': `Bearer ${localStorage.getItem('companyAuthToken')}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the form data and company profile with the new logo
        setFormData(prev => ({ ...prev, logo: result.data.logo }));
        setCompanyData(result.data);
        setCompanyProfile(result.data);
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error(result.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('An error occurred while uploading the logo');
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API - map form fields to actual DB fields
      const companyUpdateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        description: formData.description,
        logo: formData.logo, // Add logo to update data
        industry: formData.industry,
        established_date: formData.founded_year, // Map form field to actual DB field
        // Note: employee_count doesn't exist in DB, so we don't include it
      };
      
      // Update the company profile via API
      const response = await companyApi.updateCompany(companyData?.id || 1, companyUpdateData);
      
      if (response.success || response.data) {
        const updatedCompany = response.data?.company || response;
        setCompanyData(updatedCompany);
        setCompanyProfile(updatedCompany); // Update the auth hook with the new profile
        toast.success('Company profile updated successfully!');
        setEditing(false);
      } else {
        toast.error(response.message || 'Failed to update company profile');
      }
    } catch (error: unknown) {
      console.error('Error updating company profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update company profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Helper function to extract filename from path
  const getFilenameFromPath = (path: string): string => {
    if (!path) return '';
    return path.split('/').pop() || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Company Profile
        </h1>
        <p className="text-muted-foreground">Manage your company information and settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Profile Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Company Information
              </CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo">Logo</Label>
                      <div className="flex flex-col items-start gap-4">
                        <div className="relative">
                          {formData.logo ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${formData.logo}`}
                              alt="Current logo" 
                             
                              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzY0NzU4NyIvPgo8cGF0aCBkPSJNNDggMjRDMzcuMDU4OSAyNCAyOCAzMi45Mjg5IDI4IDQyQzI4IDM0Ljk1ODkgMzcuMDU4OSAyNCA0OCAyNFoiIGZpbGw9IiM4RDk4QUIiLz4KPHBhdGggZD0iTTI0IDI0QzM0Ljk0MTEgMjQgNDQgMzIuOTI4OSA0NCA0MkM0NCAzNC45NTg5IDM0Ljk0MTEgMjQgMjQgMjRaIiBmaWxsPSIjOEQ5OEFCIi8+Cjwvc3ZnPgo=';
                              }}
                              onLoad={() => {
                                // Image loaded successfully, do nothing
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-dashed flex items-center justify-center text-gray-500">
                              <Building2 className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <div className="relative">
                            <input
                              id="logo-upload"
                              title='Upload Logo'
                              type="file"
                              name="logo"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                              className="whitespace-nowrap"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                          {formData.logo && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setFormData({...formData, logo: ''})}
                              className="whitespace-nowrap w-fit"
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="e.g., Technology, Healthcare, Finance"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter company description"
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {formData.logo ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${formData.logo}`}
                            alt={`${formData.name} logo`} 
                           
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzY0NzU4NyIvPgo8cGF0aCBkPSJNNDggMjRDMzcuMDU4OSAyNCAyOCAzMi45Mjg5IDI4IDQyQzI4IDM0Ljk1ODkgMzcuMDU4OSAyNCA0OCAyNFoiIGZpbGw9IiM4RDk4QUIiLz4KPHBhdGggZD0iTTI0IDI0QzM0Ljk0MTEgMjQgNDQgMzIuOTI4OSA0NCA0MkM0NCAzNC45NTg5IDM0Ljk0MTEgMjQgMjQgMjRaIiBmaWxsPSIjOEQ5OEFCIi8+Cjwvc3ZnPgo=';
                            }}
                            onLoad={() => {
                              // Image loaded successfully, do nothing
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-dashed flex items-center justify-center text-gray-500">
                            <Building2 className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold">{formData.name}</h3>
                    </div>
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.website}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.industry}</span>
                    </div>
                    
                    
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Founded {formData.founded_year}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-muted-foreground">{formData.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
       
      </div>
    </div>
  );
}