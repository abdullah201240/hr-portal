'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { roleApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Eye,
  Pen,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Define available features for permission assignment
const AVAILABLE_FEATURES = [
  { key: 'salary_management', name: 'Salary Management' },
  { key: 'attendance_management', name: 'Attendance Management' },
  { key: 'leave_management', name: 'Leave Management' },
  { key: 'employee_management', name: 'Employee Management' },
  { key: 'department_management', name: 'Department Management' },
  { key: 'designation_management', name: 'Designation Management' },
  { key: 'payroll_processing', name: 'Payroll Processing' },
  { key: 'reports_generation', name: 'Reports Generation' },
  { key: 'policy_management', name: 'Policy Management' },
  { key: 'analytics_dashboard', name: 'Analytics Dashboard' },
];

export default function RolesManagement() {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Session expired. Please log in again.');
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoles();
    }
  }, [isAuthenticated]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAllRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingRole) {
        response = await roleApi.updateRole(editingRole.id, formData);
      } else {
        response = await roleApi.createRole(formData);
      }
      
      if (response.success) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setDialogOpen(false);
        setEditingRole(null);
        setFormData({ name: '', description: '' });
        fetchRoles();
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.message || 'Failed to save role');
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await roleApi.deleteRole(roleId);
      if (response.success) {
        toast.success('Role deleted successfully');
        fetchRoles();
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Failed to delete role');
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || ''
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setDialogOpen(true);
  };

  const handlePermissionChange = (featureKey: string, permissionType: string, value: boolean) => {
    setPermissions(prev => {
      const existingIndex = prev.findIndex(p => p.feature_key === featureKey);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [permissionType]: value };
        return updated;
      } else {
        return [...prev, { 
          feature_key: featureKey, 
          feature_name: AVAILABLE_FEATURES.find(f => f.key === featureKey)?.name || featureKey,
          [permissionType]: value,
          can_view: permissionType === 'can_view' ? value : false,
          can_create: permissionType === 'can_create' ? value : false,
          can_edit: permissionType === 'can_edit' ? value : false,
          can_delete: permissionType === 'can_delete' ? value : false,
        }];
      }
    });
  };

  if (isLoading || loading) {
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
    <div className="bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Roles Management
            </h1>
            <p className="text-muted-foreground">Manage roles and permissions for your employees</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter role name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Roles Table */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Company Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.employee_count || 0} employees</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? "default" : "destructive"}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {roles.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No roles created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first role to start assigning permissions to employees
              </p>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="mt-8">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-400" />
              Available Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_FEATURES.map((feature) => (
                <div key={feature.key} className="p-4 rounded-lg glass border">
                  <h4 className="font-medium mb-3">{feature.name}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">View</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Create</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Edit</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Delete</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}