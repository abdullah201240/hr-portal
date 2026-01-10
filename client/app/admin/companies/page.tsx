'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { companyApi } from '@/lib/api';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

type SortField = 'name' | 'email' | 'status' | 'phone';
type SortDirection = 'asc' | 'desc';

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);


  // State for search, filters, sorting, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Apply search, filter, and sort
    let result = [...companies];

    if (searchTerm) {
      result = result.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.phone && company.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(company => company.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCompanies(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, filterStatus, companies, sortField, sortDirection]);

  const fetchCompanies = async () => {
    try {
      const response = await companyApi.getAllCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number, status: string } | null>(null);

  const updateCompanyStatus = async (id: number, newStatus: string) => {
    setUpdatingStatus(id);

    try {
      // Fetch the current company data to preserve required fields
      const response = await companyApi.getCompanyById(id);
      const currentCompany = response.data;

      // Update with the new status along with existing required fields
      await companyApi.updateCompany(id, {
        status: newStatus,
        name: currentCompany.name,
        email: currentCompany.email,
        address: currentCompany.address,
        // Include other fields as needed
        phone: currentCompany.phone,
        website: currentCompany.website,
        description: currentCompany.description
      });

      // Update local state for immediate feedback
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      // fetchCompanies(); // Optional: uncomment if you want to be sure about server state
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating company status:', error);
      toast.error(error.message || 'Failed to update status');
      // Revert if needed or fetch from server
      fetchCompanies();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusChangeWithConfirmation = (id: number, newStatus: string) => {
    setPendingStatusChange({ id, status: newStatus });
    setStatusChangeDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateCompanyStatus(pendingStatusChange.id, pendingStatusChange.status);
    }
    setStatusChangeDialogOpen(false);
    setPendingStatusChange(null);
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const deleteCompany = async (id: number) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setDeletingId(pendingDeleteId);

    try {
      await companyApi.deleteCompany(pendingDeleteId);
      // Update local state to remove the company
      setCompanies(prev => prev.filter(c => c.id !== pendingDeleteId));
      toast.success('Company deleted successfully');
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast.error(error.message || 'Failed to delete company');
      // Fetch companies again to revert the optimistic update
      fetchCompanies();
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      setDeleteDialogOpen(false);
    }
  };

  // Calculate KPIs
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const suspendedCompanies = companies.filter(c => c.status === 'suspended').length;
  const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Manage Companies
          </h1>
          <p className="text-sm sm:base text-muted-foreground/90">View and manage all registered companies in the system.</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">

          <Link href="/admin/companies/create" className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Companies Card */}
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
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Total Companies</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {totalCompanies}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-emerald-500/30 to-teal-500/30 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/20">
                    <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Companies Card */}
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
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
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
                    {activeCompanies}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" }
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

        {/* Pending Companies Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative glass border-amber-500/20 overflow-hidden group hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20">
            {/* 3D Background Graphics */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400 to-amber-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Suspended</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {suspendedCompanies}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-amber-500/30 to-orange-500/30 p-3 rounded-xl backdrop-blur-sm border border-amber-400/20">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inactive Companies Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative glass border-gray-500/20 overflow-hidden group hover:border-gray-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-500/20">
            {/* 3D Background Graphics */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-400 to-gray-500 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground/70 mb-1.5">Inactive</p>
                  <motion.h3
                    className="text-2xl font-bold bg-gradient-to-r from-gray-400 via-slate-400 to-gray-400 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {inactiveCompanies}
                  </motion.h3>
                </div>
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 10, 0, -10, 0]
                  }}
                  transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-gray-500/30 to-slate-500/30 p-3 rounded-xl backdrop-blur-sm border border-gray-400/20">
                    <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400 drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table Card with All Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass border-none shadow-none rounded-none overflow-hidden">

          {/* Card Header with Controls */}
          <CardHeader className="p-4 sm:p-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 glass border-border text-foreground w-full"
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

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-11 glass border-border w-full">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-foreground/70" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-white/10">
                  <tr>
                    <th
                      className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group min-w-[150px]"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Company</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group min-w-[150px]"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Contact</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group min-w-[120px]"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Phone</span>
                        {getSortIcon('phone')}
                      </div>
                    </th>
                    <th
                      className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group min-w-[120px]"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground">Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-foreground min-w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.length > 0 ? (
                    currentItems.map((company, index) => (
                      <motion.tr
                        key={company.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold mr-3 shadow-lg">
                              {company.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{company.name}</div>
                              <div className="text-xs text-muted-foreground dark:text-foreground/70">ID: {company.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground/90 dark:text-foreground/90">{company.email}</td>
                        <td className="py-4 px-4 text-sm text-foreground/90 dark:text-foreground/90">{company.phone || '-'}</td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <AlertDialog open={statusChangeDialogOpen && pendingStatusChange?.id === company.id} onOpenChange={(open) => {
                              if (!open) {
                                setStatusChangeDialogOpen(false);
                                setPendingStatusChange(null);
                              }
                            }}>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to change the status of <strong>{companies.find(c => c.id === pendingStatusChange?.id)?.name}</strong> to <strong>{pendingStatusChange?.status}</strong>? This action can be reverted later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setStatusChangeDialogOpen(false);
                                    setPendingStatusChange(null);
                                  }}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={confirmStatusChange}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Select
                              disabled={updatingStatus === company.id}
                              value={company.status}
                              onValueChange={(value) => handleStatusChangeWithConfirmation(company.id, value)}
                            >
                              <SelectTrigger className={`h-9 w-[130px] border-none shadow-none focus:ring-0 capitalize ${company.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' :
                                company.status === 'suspended' ? 'text-amber-400 bg-amber-500/10' :
                                  'text-gray-400 bg-gray-500/10'
                                }`}>
                                <div className="flex items-center">
                                  {updatingStatus === company.id ? (
                                    <div className="h-3 w-3 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                                  ) : (
                                    <div className={`h-2 w-2 rounded-full mr-2 ${company.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                                      company.status === 'suspended' ? 'bg-amber-400' :
                                        'bg-gray-400'
                                      }`} />
                                  )}
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="glass border-border">
                                <SelectItem value="active" className="text-emerald-400">Active</SelectItem>
                                <SelectItem value="inactive" className="text-gray-400">Inactive</SelectItem>
                                <SelectItem value="suspended" className="text-amber-400">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-2 hover:bg-blue-500/10 hover:text-blue-400"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link href={`/admin/companies/${company.id}/edit`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 hover:bg-emerald-500/10 hover:text-emerald-400"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <div className="relative">
                              <AlertDialog open={deleteDialogOpen && pendingDeleteId === company.id} onOpenChange={(open) => {
                                if (!open) {
                                  setDeleteDialogOpen(false);
                                  setPendingDeleteId(null);
                                }
                              }}>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => {
                                      setDeleteDialogOpen(false);
                                      setPendingDeleteId(null);
                                    }}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 hover:bg-red-500/10 hover:text-red-400"
                                title="Delete"
                                disabled={deletingId === company.id}
                                onClick={() => deleteCompany(company.id)}
                              >
                                {deletingId === company.id ? (
                                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground/90 text-lg font-medium">No companies found</p>
                          <p className="text-muted-foreground/80 text-sm mt-1">
                            {searchTerm || filterStatus !== 'all'
                              ? 'Try adjusting your search or filters'
                              : 'Get started by adding your first company'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden flex flex-col divide-y divide-border">
              {currentItems.length > 0 ? (
                currentItems.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold mr-4 shadow-lg flex-shrink-0">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-foreground truncate max-w-[180px]">{company.name}</h3>
                          <p className="text-xs text-foreground/60">ID: {company.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Select
                          disabled={updatingStatus === company.id}
                          value={company.status}
                          onValueChange={(value) => handleStatusChangeWithConfirmation(company.id, value)}
                        >
                          <SelectTrigger className={`h-8 w-[110px] border-none shadow-none focus:ring-0 capitalize text-xs ${company.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' :
                            company.status === 'suspended' ? 'text-amber-400 bg-amber-500/10' :
                              'text-gray-400 bg-gray-500/10'
                            }`}>
                            <div className="flex items-center">
                              {updatingStatus === company.id ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                              ) : (
                                <div className={`h-2 w-2 rounded-full mr-2 ${company.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                                  company.status === 'suspended' ? 'bg-amber-400' :
                                    'bg-gray-400'
                                  }`} />
                              )}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="glass border-white/10">
                            <SelectItem value="active" className="text-emerald-400">Active</SelectItem>
                            <SelectItem value="inactive" className="text-gray-400">Inactive</SelectItem>
                            <SelectItem value="suspended" className="text-amber-400">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Contact</p>
                        <p className="text-foreground/90 truncate">{company.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Phone</p>
                        <p className="text-foreground/90">{company.phone || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/companies/${company.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 hover:bg-emerald-500/10 hover:text-emerald-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-400"
                        disabled={deletingId === company.id}
                        onClick={() => deleteCompany(company.id)}
                      >
                        {deletingId === company.id ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 px-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground/90 text-lg font-medium">No companies found</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 0 && (
              <div className="p-4 sm:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-sm text-center sm:text-left text-foreground/80">
                    Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredCompanies.length)}</span> of{' '}
                    <span className="font-medium text-foreground">{filteredCompanies.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-foreground/70 hidden sm:block">Rows per page:</span>
                    <span className="text-sm text-foreground/70 sm:hidden text-center">Rows:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="h-9 w-20 glass border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent className="flex-wrap justify-center">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

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
    </div>
  );
}