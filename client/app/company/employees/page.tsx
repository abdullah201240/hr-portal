'use client';
import  { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  LayoutGrid,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types/employee';
import Image from 'next/image';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EmployeesPage = () => {
  const { isAuthenticated, isLoading } = useCompanyAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [limit] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllEmployees({
        page: currentPage,
        limit,
        search: searchTerm
      });
      
      if (response.success) {
        setEmployees(response.data);
        setTotalPages(response.pagination.pages);
        setTotalEmployees(response.pagination.total);
      } else {
        toast.error(response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchEmployees();
    }
  }, [currentPage, searchTerm, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login/company');
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render anything while checking authentication
  if (isLoading) {
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

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleDeleteEmployee = async () => {
    if (!deletingId) return;
    try {
      const response = await employeeApi.deleteEmployee(deletingId);
      if (response.success) {
        toast.success(response.message || 'Employee deleted successfully');
        fetchEmployees(); // Refresh the list
      } else {
        toast.error(response.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    router.push(`/company/employees/${employee.id}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    router.push(`/company/employees/edit/${employee.id}`);
  };

  // Stats
  const activeEmployeesCount = employees.filter((emp: Employee) => emp.status === 'active').length;
  const inactiveEmployeesCount = employees.filter((emp: Employee) => emp.status === 'inactive').length;


  return (
    <div className="bg-background space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
            Employee Directory
          </h1>
          <p className="text-muted-foreground">
            Manage your workforce efficiently with centralized data.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button 
            onClick={() => router.push('/company/employees/create')}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Employees', value: totalEmployees, icon: Users, color: 'emerald' },
          { title: 'Active Staff', value: activeEmployeesCount, icon: UserCheck, color: 'teal' },
          { title: 'Inactive Staff', value: inactiveEmployeesCount, icon: UserX, color: 'rose' },
          { title: 'Departments', value: [...new Set(employees.map(e => e.department).filter(Boolean))].length, icon: LayoutGrid, color: 'blue' }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1), type: "spring", stiffness: 200 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`relative glass border-${stat.color}-500/20 overflow-hidden group hover:border-${stat.color}-500/40 transition-all duration-500`}>
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
              </div>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground/70 mb-1">{stat.title}</p>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-700 dark:from-${stat.color}-400 dark:to-${stat.color}-600 bg-clip-text text-transparent`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`relative bg-${stat.color}-500/10 p-2.5 rounded-xl border border-${stat.color}-500/20`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass border-none shadow-none rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 glass border-border focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-11 glass border-border w-[150px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 opacity-70" />
                      <SelectValue placeholder="Status" />
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-emerald-500/5 border-b border-white/5">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="p-4"><Skeleton className="h-12 w-full" /></td>
                        </tr>
                      ))
                    ) : employees.length > 0 ? (
                      employees.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20">
                                 <Image
                                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${employee.image || 'uploads/employees/placeholder.avif'}`}
                                  alt={employee.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full rounded-full object-cover"
                                  unoptimized
                                />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${employee.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground group-hover:text-emerald-500 transition-colors">{employee.name}</h3>
                                <p className="text-xs text-muted-foreground font-mono uppercase">{employee.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-foreground/80">
                                <Mail className="h-3 w-3 mr-2 opacity-50" />
                                {employee.email}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 mr-2 opacity-50" />
                                {employee.phone || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <div className="font-medium text-foreground">{employee.designation || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{employee.department || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge 
                              className={employee.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-none' 
                                : 'bg-rose-500/10 text-rose-500 border-none'}
                            >
                              {(employee.status || 'inactive').charAt(0).toUpperCase() + (employee.status || 'inactive').slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleViewEmployee(employee)}
                                className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditEmployee(employee)}
                                className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => confirmDelete(employee.id)}
                                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Users className="h-16 w-16 opacity-10" />
                            <p className="text-lg">No employees found matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground">{(currentPage - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(currentPage * limit, totalEmployees)}</span> of <span className="text-foreground">{totalEmployees}</span> employees
                </p>
                <Pagination className="w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this employee record and all associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEmployee}
              className="bg-rose-500 hover:bg-rose-600 border-none"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesPage;