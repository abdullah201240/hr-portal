'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Settings, 
  Mail, 
  Bell, 
  Shield, 
  Key, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  EyeOff,
  Save,
  Lock,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Wifi,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { employeeApi } from '@/lib/api';

export default function EmployeeSettingsPage() {
  const { isAuthenticated, isLoading, employeeProfile } = useEmployeeAuth();
  const router = useRouter();
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password verification state
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    leaveApprovals: true,
    attendanceReminders: true,
    announcements: true
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    autoLogout: true,
    sessionTimeout: 30,
    loginAlerts: true
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to access settings.');
      router.push('/login/employee');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (employeeProfile) {
      setPersonalInfo({
        name: employeeProfile.name || '',
        email: employeeProfile.email || '',
        phone: employeeProfile.phone || '',
        address: employeeProfile.address || '',
        emergency_contact: employeeProfile.emergency_contact || '',
        emergency_phone: employeeProfile.emergency_phone || ''
      });
      
      // Load settings from localStorage
      const savedNotifications = localStorage.getItem('employeeNotifications');
      const savedSecurity = localStorage.getItem('employeeSecurity');
      const savedAppearance = localStorage.getItem('employeeAppearance');
      
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedSecurity) setSecurity(JSON.parse(savedSecurity));
      if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
    }
  }, [employeeProfile]);

  const handleSavePersonalInfo = async () => {
    setSavingSection('personal');
    try {
      const response = await employeeApi.updateEmployee(employeeProfile.id, personalInfo);
      if (response.success) {
        toast.success('Personal information updated successfully!');
        // Update local storage
        localStorage.setItem('employeeProfile', JSON.stringify({
          ...employeeProfile,
          ...personalInfo
        }));
      } else {
        toast.error(response.message || 'Failed to update personal information');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating personal information');
    } finally {
      setSavingSection(null);
    }
  };

  const verifyCurrentPassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    setVerifyingPassword(true);
    try {
      const response = await employeeApi.verifyPassword(passwordData.currentPassword);
      
      if (response.success) {
        setCurrentPasswordVerified(true);
        toast.success('Current password verified!');
      } else {
        toast.error(response.message || 'Incorrect current password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error verifying password');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSavingSection('password');
    try {
      const response = await employeeApi.changePassword(passwordData.newPassword);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        
        // Reset all password fields and verification state
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setCurrentPasswordVerified(false);
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error changing password');
    } finally {
      setSavingSection(null);
    }
  };

  const resetPasswordVerification = () => {
    setCurrentPasswordVerified(false);
    setPasswordData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSaveNotifications = () => {
    setSavingSection('notifications');
    try {
      localStorage.setItem('employeeNotifications', JSON.stringify(notifications));
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveSecurity = () => {
    setSavingSection('security');
    try {
      localStorage.setItem('employeeSecurity', JSON.stringify(security));
      toast.success('Security settings saved!');
    } catch (error) {
      toast.error('Failed to save security settings');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAppearance = () => {
    setSavingSection('appearance');
    try {
      localStorage.setItem('employeeAppearance', JSON.stringify(appearance));
      toast.success('Appearance settings saved!');
    } catch (error) {
      toast.error('Failed to save appearance settings');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSwitchChange = (section: string, key: string) => {
    switch (section) {
      case 'notifications':
        setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }));
        break;
      case 'security':
        setSecurity(prev => ({ ...prev, [key]: !prev[key as keyof typeof security] }));
        break;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your personal information, security, and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

       

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-400" />
                Change Password
              </CardTitle>
              <CardDescription>{currentPasswordVerified ? 'Enter your new password' : 'Verify your current password first'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Password Verification Step */}
              {!currentPasswordVerified ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        onKeyDown={(e) => e.key === 'Enter' && verifyCurrentPassword()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={verifyCurrentPassword} 
                      disabled={verifyingPassword || !passwordData.currentPassword}
                      className="w-full gradient-emerald"
                    >
                      {verifyingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Current Password
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                /* New Password Change Step */
                <>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Current password verified successfully!</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">You can now change your password below.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={resetPasswordVerification} 
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={savingSection === 'password' || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      className="flex-1 gradient-emerald"
                    >
                      {savingSection === 'password' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

       
      </div>
    </div>
  );
}