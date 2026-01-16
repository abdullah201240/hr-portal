'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, User, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { adminProfile, setAdminProfile } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
    try {
      // Don't set loading if we already have data to show (improves UX)
      if (!adminProfile) setLoading(true);
      
      console.log('Attempting to fetch profile from API...');
      const profile = await adminApi.getCurrentAdminProfile();
      console.log('API response:', profile);
      
      if (profile.success && profile.data) {
        // Update the profile in localStorage and context
        setAdminProfile(profile.data);
        
        setFormData({
          name: profile.data.name || '',
          email: profile.data.email || '',
          role: profile.data.role || '',
          status: profile.data.status || ''
        });
      }
    } catch (apiError: unknown) {
      console.error('API call failed:', apiError);
      
      // Check if this is specifically an authentication error
      const errorMessage = (apiError as Error)?.message?.toLowerCase() || '';
      const isAuthError = errorMessage.includes('401') || 
                         errorMessage.includes('authorization') || 
                         errorMessage.includes('token');
      
      if (isAuthError) {
        console.log('Authentication error detected, session might be invalid');
        // We don't redirect here, let the Layout's guard handle it if isAuthenticated becomes false
        // or just let the user see the current local data if available
      }
      
      // Fallback to local data if not already set
      if (!adminProfile) {
        const storedProfile = localStorage.getItem('adminProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setAdminProfile(profile);
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            role: profile.role || '',
            status: profile.status || ''
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [adminProfile, setAdminProfile]);
  // Load admin profile data
  useEffect(() => {
        fetchProfile();
  }, [fetchProfile]); // Only run once on mount

  // Update form data when adminProfile from context changes (e.g. after fetchProfile succeeds)
  useEffect(() => {
    if (adminProfile) {
      setFormData({
        name: adminProfile.name || '',
        email: adminProfile.email || '',
        role: adminProfile.role || '',
        status: adminProfile.status || ''
      });
      setLoading(false);
    }
  }, [adminProfile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);



  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Extract admin ID from the stored profile
      const storedProfile = localStorage.getItem('adminProfile');
      if (!storedProfile) {
        throw new Error('Admin profile not found');
      }
      
      const profile = JSON.parse(storedProfile);
      const adminId = profile.id;

      // Prepare update data (excluding password field)
      const updateData: { name: string; email: string } = {
        name: formData.name,
        email: formData.email
      };

      // Update admin profile
      const updatedAdmin = await adminApi.updateAdmin(adminId, updateData);
      
      // Update the profile in localStorage and context
      const newProfile = { ...profile, ...updatedAdmin };
      setAdminProfile(newProfile);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error((error as Error).message || 'Failed to update profile');
    } 
  }, [formData.email, formData.name, setAdminProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  console.log('Rendering profile page with formData:', formData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="glass-strong border-emerald-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            Personal Information
          </CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.role}
                    disabled
                    className="pl-9 bg-muted/30"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <div className="pl-9">
                    {formData.status && (
                      <Badge 
                        variant={formData.status === 'active' ? 'default' : 
                                 formData.status === 'inactive' ? 'secondary' : 
                                 'destructive'}
                        className="capitalize"
                      >
                        {formData.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            
          </form>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // Reset form data to original values
                    if (adminProfile) {
                      setFormData({
                        name: adminProfile.name || '',
                        email: adminProfile.email || '',
                        role: adminProfile.role || '',
                        status: adminProfile.status || ''
                      });
                    }
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="profile-form"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}