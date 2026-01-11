'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save, User, Mail, KeyRound, ShieldCheck } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);

  // Load admin profile data
  useEffect(() => {
    if (adminProfile) {
      setFormData({
        name: adminProfile.name || '',
        email: adminProfile.email || '',
        role: adminProfile.role || '',
        status: adminProfile.status || ''
      });
      setLoading(false);
    } else {
      // Fetch admin profile if not in state
      fetchProfile();
    }
  }, [adminProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // First try to get the profile from the API
      try {
        const profile = await adminApi.getCurrentAdminProfile();
        
        // Update the profile in localStorage and context
        setAdminProfile(profile.data);
        
        setFormData({
          name: profile.data.name || '',
          email: profile.data.email || '',
          role: profile.data.role || '',
          status: profile.data.status || ''
        });
      } catch (apiError) {
        // If API fails, fallback to localStorage
        console.warn('Failed to fetch profile from API, using localStorage:', apiError);
        const storedProfile = localStorage.getItem('adminProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setAdminProfile(profile); // Update context
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            role: profile.role || '',
            status: profile.status || ''
          });
        } else {
          toast.error('Profile data not found');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Extract admin ID from the stored profile
      const storedProfile = localStorage.getItem('adminProfile');
      if (!storedProfile) {
        throw new Error('Admin profile not found');
      }
      
      const profile = JSON.parse(storedProfile);
      const adminId = profile.id;

      // Prepare update data (excluding password field)
      const updateData: any = {
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
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

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

            <div className="flex items-center gap-3 mt-8">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setFormData({
                        name: adminProfile?.name || '',
                        email: adminProfile?.email || '',
                        role: adminProfile?.role || '',
                        status: adminProfile?.status || ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}