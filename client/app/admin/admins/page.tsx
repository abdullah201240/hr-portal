'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { adminApi } from '@/lib/api';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search, filters, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    // Apply search and filter
    let result = [...admins];
    
    if (searchTerm) {
      result = result.filter(admin => 
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(admin => admin.status === filterStatus);
    }
    
    setFilteredAdmins(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, filterStatus, admins]);

  const fetchAdmins = async () => {
    try {
      const response = await adminApi.getAllAdmins();
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id: number) => {
    try {
      await adminApi.deleteAdmin(id);
      toast.success('Admin deleted successfully');
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

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
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Manage Admins
        </h1>
        <p className="text-muted-foreground">View and manage all administrators in the system.</p>
      </motion.div>
      
      {/* Controls Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-6 glass rounded-xl border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 glass border-white/10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 glass border-white/10">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              className="h-12 flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              onClick={() => router.push('/admin/admins/create')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              className="h-12 flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => router.push('/admin/admins/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </motion.div>
      
      <div className="glass border-white/10 overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-white/10 p-6">
          <div className="text-xl font-bold flex items-center justify-between">
            <span>Admins List</span>
            <span className="text-sm font-normal text-muted-foreground">
              Showing {currentItems.length} of {filteredAdmins.length} admins
            </span>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground">Admin</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground">Email</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground">Role</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground">Status</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentItems.length > 0 ? (
                  currentItems.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {admin.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">{admin.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                          admin.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="p-2"
                            onClick={() => router.push(`/admin/admins/${admin.id}/edit`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="p-2"
                            onClick={() => router.push(`/admin/admins/${admin.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="p-2 text-red-500 hover:text-red-400"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this admin?')) {
                                deleteAdmin(admin.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="relative">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="p-2"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-muted-foreground">
                      No admins found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
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
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}