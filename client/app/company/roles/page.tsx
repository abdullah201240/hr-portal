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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserMinus,
  Search,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeeApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [roleEmployees, setRoleEmployees] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

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
        if (response.data.length > 0 && !selectedRole) {
          setSelectedRole(response.data[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchRoleDetails(selectedRole.id);
    }
  }, [selectedRole]);

  const fetchRoleDetails = async (roleId: number) => {
    try {
      // Fetch permissions
      const permResp = await roleApi.getRolePermissions(roleId);
      if (permResp.success) {
        setPermissions(permResp.data);
      }

      // Fetch employees assigned to this role
      const empResp = await roleApi.getRoleEmployees(roleId);
      if (empResp.success) {
        setRoleEmployees(empResp.data);
      }
    } catch (error: any) {
      console.error('Error fetching role details:', error);
      toast.error('Failed to load role details');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllEmployees();
    }
  }, [isAuthenticated]);

  const fetchAllEmployees = async () => {
    try {
      const response = await employeeApi.getAllEmployees({ limit: 100 });
      if (response.success) {
        setAllEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching all employees:', error);
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
        updated[existingIndex] = { ...updated[existingIndex], [permissionType]: value ? 1 : 0 };
        return updated;
      } else {
        return [...prev, {
          feature_key: featureKey,
          feature_name: AVAILABLE_FEATURES.find(f => f.key === featureKey)?.name || featureKey,
          can_view: permissionType === 'can_view' ? (value ? 1 : 0) : 0,
          can_create: permissionType === 'can_create' ? (value ? 1 : 0) : 0,
          can_edit: permissionType === 'can_edit' ? (value ? 1 : 0) : 0,
          can_delete: permissionType === 'can_delete' ? (value ? 1 : 0) : 0,
        }];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setIsSavingPermissions(true);
      const response = await roleApi.updateRolePermissions(selectedRole.id, { permissions });
      if (response.success) {
        toast.success('Permissions updated successfully');
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error.message || 'Failed to update permissions');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleAssignEmployee = async (employeeId: number) => {
    if (!selectedRole) return;

    try {
      setIsAssigning(true);
      const response = await roleApi.assignRoleToEmployee({
        employee_id: employeeId,
        role_id: selectedRole.id
      });

      if (response.success) {
        toast.success('Employee assigned successfully');
        fetchRoleDetails(selectedRole.id);
        fetchRoles(); // Update counts
      }
    } catch (error: any) {
      console.error('Error assigning employee:', error);
      toast.error(error.message || 'Failed to assign employee');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: number) => {
    if (!selectedRole) return;
    if (!confirm('Are you sure you want to remove this employee from the role?')) return;

    try {
      const response = await roleApi.removeRoleFromEmployee({
        employee_id: employeeId,
        role_id: selectedRole.id
      });

      if (response.success) {
        toast.success('Employee removed successfully');
        fetchRoleDetails(selectedRole.id);
        fetchRoles(); // Update counts
      }
    } catch (error: any) {
      console.error('Error removing employee:', error);
      toast.error(error.message || 'Failed to remove employee');
    }
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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Roles List Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Roles
          </h2>
          <Button size="sm" onClick={openCreateDialog} className="h-8 w-8 p-0 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRole?.id === role.id
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${selectedRole?.id === role.id ? 'text-emerald-400' : 'text-zinc-100'}`}>
                    {role.name}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {role.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-emerald-500/20 text-emerald-500/70">
                    {role.employee_count || 0}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(role);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(role.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {roles.length === 0 && (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10">
              <Shield className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No roles created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Details/Details Area */}
      <div className="flex-1 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {selectedRole ? (
            <motion.div
              key={selectedRole.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              <Card className="glass border-white/10 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-2xl font-black text-white">{selectedRole.name}</CardTitle>
                        <Badge className={`${selectedRole.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {selectedRole.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 italic">
                        {selectedRole.description || 'No description provided for this role.'}
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 p-3 rounded-2xl border border-white/5 shadow-xl">
                      <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-2xl font-black text-emerald-400">{roleEmployees.length}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Employees</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="permissions" className="w-full">
                    <div className="px-6 border-b border-white/5 bg-zinc-900/30">
                      <TabsList className="bg-transparent h-14 gap-8">
                        <TabsTrigger
                          value="permissions"
                          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none h-14 px-0 font-bold uppercase tracking-widest text-[11px]"
                        >
                          Permissions
                        </TabsTrigger>
                        <TabsTrigger
                          value="employees"
                          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none h-14 px-0 font-bold uppercase tracking-widest text-[11px]"
                        >
                          Employees
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="permissions" className="p-6 m-0 focus-visible:outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AVAILABLE_FEATURES.map((feature) => {
                          const rolePerm = permissions.find(p => p.feature_key === feature.key) || {};
                          return (
                            <div key={feature.key} className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/20 transition-all">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                <h4 className="font-bold text-sm text-zinc-200">{feature.name}</h4>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-zinc-700">Feature</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                {[
                                  { key: 'can_view', label: 'View' },
                                  { key: 'can_create', label: 'Create' },
                                  { key: 'can_edit', label: 'Edit' },
                                  { key: 'can_delete', label: 'Delete' }
                                ].map(pType => (
                                  <div key={pType.key} className="flex items-center justify-between">
                                    <span className="text-[11px] text-zinc-500 font-bold uppercase">{pType.label}</span>
                                    <Switch
                                      checked={!!rolePerm[pType.key]}
                                      onCheckedChange={(checked) => handlePermissionChange(feature.key, pType.key, checked)}
                                      className="data-[state=checked]:bg-emerald-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end mt-8">
                        <Button
                          onClick={handleSavePermissions}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold min-w-[160px] shadow-lg shadow-emerald-500/20"
                          disabled={isSavingPermissions}
                        >
                          {isSavingPermissions ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Update Permissions
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="employees" className="p-6 m-0 focus-visible:outline-none">
                      <div className="space-y-6">
                        {/* Assign Employee Area */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Assign New Employee</h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                              <Select onValueChange={(val) => handleAssignEmployee(parseInt(val))}>
                                <SelectTrigger className="pl-10 bg-zinc-900 border-white/10 rounded-xl h-12">
                                  <SelectValue placeholder="Search employee by name or ID..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 max-h-[300px]">
                                  <div className="p-2 sticky top-0 bg-zinc-950 border-b border-white/5 z-10">
                                    <Input
                                      placeholder="Filter employees..."
                                      className="h-8 text-xs h-9 mb-1"
                                      value={employeeSearchTerm}
                                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                    />
                                  </div>
                                  {allEmployees
                                    .filter(e =>
                                      !roleEmployees.some(re => re.employee_id === e.id) &&
                                      (e.employee_name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                                        e.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase()))
                                    )
                                    .map(emp => (
                                      <SelectItem key={emp.id} value={emp.id.toString()} className="focus:bg-emerald-500 focus:text-white cursor-pointer py-3 border-b border-white/5 last:border-0">
                                        <div className="flex flex-col">
                                          <span className="font-bold">{emp.employee_name}</span>
                                          <span className="text-[10px] text-zinc-500 uppercase">ID: {emp.employeeId || emp.id}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  {allEmployees.length === 0 && (
                                    <div className="p-4 text-center text-zinc-500 text-sm">No employees found</div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Current Employees List */}
                        <div>
                          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Assigned Employees
                            <Badge variant="outline" className="rounded-md border-zinc-800 text-zinc-600">{roleEmployees.length}</Badge>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {roleEmployees.map((emp) => (
                              <div key={emp.id} className="group p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between hover:bg-zinc-800 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                                    <Users className="h-5 w-5 text-zinc-400 group-hover:text-emerald-400" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-sm text-zinc-200">{emp.employee_name || 'System User'}</h5>
                                    <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">
                                      {emp.employeeId || 'ID: ' + emp.employee_id}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 rounded-full"
                                  onClick={() => handleRemoveEmployee(emp.employee_id)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}

                            {roleEmployees.length === 0 && (
                              <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-white/5 bg-zinc-900/20">
                                <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 text-sm font-medium">No employees assigned to this role yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center glass border border-dashed border-white/10 rounded-3xl">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                <Shield className="h-10 w-10 text-zinc-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-zinc-300 mb-2">Select a Role</h3>
              <p className="text-zinc-500 max-w-[280px]">
                Click on a role from the sidebar to manage its specific permissions and assigned staff.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Edit/Create Dialog (kept the same logic but updated UI) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-white/10 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gradient-to-r from-emerald-500/20 to-transparent border-b border-white/5">
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-emerald-400">
              {editingRole ? 'Update Role' : 'Initialize Role'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Manager, HR, Super Admin..."
                className="bg-zinc-900 border-white/10 h-12 rounded-xl focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Purpose/Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What responsibilities does this role carry?"
                className="bg-zinc-900 border-white/10 rounded-xl resize-none focus:ring-emerald-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl font-bold">
                Discard
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black px-8 shadow-lg shadow-emerald-500/20">
                {editingRole ? 'Commit Changes' : 'Register Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
