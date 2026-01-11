'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { designationApi, departmentApi } from '@/lib/api';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
  department_id: number | null;
  department_name: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

type SortField = 'name' | 'department_name' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [filteredDesignations, setFilteredDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search, filters, sorting, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    department_id: '' as string,
    description: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply search, filter, and sort
    let result = Array.isArray(designations) ? [...designations] : [];

    if (searchTerm) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.department_name && d.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(d => d.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sortField] || '';
      let bValue: any = b[sortField] || '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredDesignations(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, designations, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [desigRes, deptRes] = await Promise.all([
        designationApi.getAllDesignations(new URLSearchParams({ limit: '1000' })),
        departmentApi.getAllDepartments(new URLSearchParams({ limit: '1000' }))
      ]);

      if (desigRes.success) setDesignations(desigRes.data || []);
      else setDesignations([]);
      
      if (deptRes.success) setDepartments(deptRes.data || []);
      else setDepartments([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      // In case of error, ensure we have empty arrays
      setDesignations([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const openDialog = (designation?: Designation) => {
    if (designation) {
      setFormData({
        name: designation.name,
        department_id: designation.department_id?.toString() || '',
        description: designation.description || '',
        status: designation.status
      });
      setEditingId(designation.id);
    } else {
      setFormData({ name: '', department_id: '', description: '', status: 'active' });
      setEditingId(null);
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const submitData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : null
    };

    try {
      if (editingId) {
        const response = await designationApi.updateDesignation(editingId, submitData);
        if (response.success) {
          toast.success('Designation updated successfully');
          fetchData(); // Refresh to get updated department names
          closeDialog();
        }
      } else {
        const response = await designationApi.createDesignation(submitData);
        if (response.success) {
          toast.success('Designation created successfully');
          fetchData();
          closeDialog();
        }
      }
    } catch (error: any) {
      console.error('Error saving designation:', error);
      if (error.message.includes('Validation error')) {
        const errors: Record<string, string> = {};
        const errorParts = error.message.replace('Validation error: ', '').split('; ');
        errorParts.forEach((part: string) => {
          const [field, message] = part.split(': ');
          if (field && message) errors[field.trim()] = message.trim();
        });
        setFormErrors(errors);
      } else {
        toast.error(error.message || 'Failed to save designation');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await designationApi.deleteDesignation(deletingId);
      setDesignations(prev => prev.filter(d => d.id !== deletingId));
      toast.success('Designation deleted successfully');
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast.error('Failed to delete designation');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1 text-emerald-400" /> : 
      <ArrowDown className="h-4 w-4 ml-1 text-emerald-400" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDesignations.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background pt-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Manage Designations
          </h1>
          <p className="text-sm sm:base text-muted-foreground/90">Define and manage job roles within your organization.</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button 
            onClick={() => openDialog()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative glass border-emerald-500/20 overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20">
            {/* 3D Background Graphics */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Total Designations</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {Array.isArray(designations) ? designations.length : 0}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-emerald-500/30 to-teal-500/30 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/20">
                    <Briefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative glass border-green-500/20 overflow-hidden group hover:border-green-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20">
            {/* 3D Background Graphics */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Active</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {Array.isArray(designations) ? designations.filter(d => d.status === 'active').length : 0}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-3 rounded-xl backdrop-blur-sm border border-green-400/20">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative glass border-blue-500/20 overflow-hidden group hover:border-blue-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
            {/* 3D Background Graphics */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Departments</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {Array.isArray(departments) ? departments.length : 0}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-3 rounded-xl backdrop-blur-sm border border-blue-400/20">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-none shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by role, department or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 glass border-border text-foreground w-full focus:ring-emerald-500/50"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-11 glass border-border w-full">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-foreground/70" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-white/10">
                  <tr>
                    <th
                      className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Designation</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('department_name')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Department</span>
                        {getSortIcon('department_name')}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-sm text-foreground">
                      Description
                    </th>
                    <th
                      className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right font-semibold text-sm text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {currentItems.length > 0 ? (
                      currentItems.map((designation, index) => (
                        <motion.tr
                          key={designation.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold mr-3 shadow-lg">
                                {designation.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="font-medium text-foreground">{designation.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20">
                              {designation.department_name || 'Unassigned'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">
                            {designation.description || '-'}
                          </td>
                          <td className="py-4 px-6">
                            <Badge 
                              className={designation.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none' 
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none'}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${designation.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {designation.status.charAt(0).toUpperCase() + designation.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDialog(designation)}
                                className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => confirmDelete(designation.id)}
                                className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-lg font-medium">No designations found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden flex flex-col divide-y divide-border">
              {currentItems.length > 0 ? (
                currentItems.map((designation, index) => (
                  <motion.div
                    key={designation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                          {designation.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{designation.name}</h3>
                          <p className="text-xs text-muted-foreground">{designation.department_name || 'No Dept'}</p>
                        </div>
                      </div>
                      <Badge 
                        className={designation.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-none' 
                          : 'bg-red-500/10 text-red-500 border-none'}
                      >
                        {designation.status.charAt(0).toUpperCase() + designation.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{designation.description || 'No description'}</p>
                    <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDialog(designation)}
                        className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDelete(designation.id)}
                        className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center p-4">
                  <Briefcase className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No designations found</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 0 && (
              <div className="p-4 sm:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredDesignations.length)}</span> of{' '}
                  <span className="font-medium text-foreground">{filteredDesignations.length}</span> results
                </div>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, idx) => (
                        <PaginationItem key={idx + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(idx + 1)}
                            isActive={currentPage === idx + 1}
                            className="cursor-pointer"
                          >
                            {idx + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md glass border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {editingId ? 'Edit Designation' : 'New Designation'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Designation Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Senior Developer, HR Manager"
                className={`glass border-border focus:ring-emerald-500/50 ${formErrors.name ? 'border-red-500' : ''}`}
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department_id" className="text-sm font-medium">Department</Label>
              <Select 
                value={formData.department_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, department_id: val }))}
              >
                <SelectTrigger className="glass border-border">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.department_id && <p className="text-xs text-red-500 mt-1">{formErrors.department_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe the role..."
                rows={3}
                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="glass border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={closeDialog} className="glass border-border">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none min-w-[100px]"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  editingId ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this designation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="glass border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 border-none text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
