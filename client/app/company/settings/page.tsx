'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Settings, Mail, Bell, Shield, Key, CreditCard, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanySettingsPage() {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    security: {
      twoFactor: false,
      autoLogout: true,
      sessionTimeout: 30
    },
    privacy: {
      profilePublic: false,
      showOnlineStatus: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to access settings.');
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Load settings from storage or API
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSwitchChange = (section: string, key: string) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      (newSettings[section as keyof typeof newSettings] as any)[key] = !(newSettings[section as keyof typeof newSettings] as any)[key];
      return newSettings;
    });
  };

  const handleSaveSettings = () => {
    setLoading(true);
    try {
      // Save settings to storage or API
      localStorage.setItem('companySettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save settings');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Company Settings
        </h1>
        <p className="text-muted-foreground">Manage your company preferences and security settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-400" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">Email</Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={() => handleSwitchChange('notifications', 'email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">Push</Label>
                    <p className="text-xs text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.notifications.push}
                    onCheckedChange={() => handleSwitchChange('notifications', 'push')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications" className="text-sm font-medium">SMS</Label>
                    <p className="text-xs text-muted-foreground">Receive SMS notifications</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.notifications.sms}
                    onCheckedChange={() => handleSwitchChange('notifications', 'sms')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Security
              </CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add extra layer of security</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.security.twoFactor}
                    onCheckedChange={() => handleSwitchChange('security', 'twoFactor')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-logout" className="text-sm font-medium">Auto Logout</Label>
                    <p className="text-xs text-muted-foreground">Automatically logout after inactivity</p>
                  </div>
                  <Switch
                    id="auto-logout"
                    checked={settings.security.autoLogout}
                    onCheckedChange={() => handleSwitchChange('security', 'autoLogout')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout" className="text-sm font-medium">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        sessionTimeout: parseInt(e.target.value) || 30
                      }
                    }))}
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-emerald-400" />
                Privacy
              </CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile" className="text-sm font-medium">Public Profile</Label>
                    <p className="text-xs text-muted-foreground">Allow public viewing of company profile</p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={settings.privacy.profilePublic}
                    onCheckedChange={() => handleSwitchChange('privacy', 'profilePublic')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status" className="text-sm font-medium">Show Online Status</Label>
                    <p className="text-xs text-muted-foreground">Display when company is online</p>
                  </div>
                  <Switch
                    id="online-status"
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={() => handleSwitchChange('privacy', 'showOnlineStatus')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <Button onClick={handleSaveSettings} disabled={loading} className="px-8">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </div>
  );
}