'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { designationApi, departmentApi } from '@/lib/api';

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

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderDir, setOrderDir] = useState('DESC');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    department_id: null as number | null,
    description: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch designations and departments
  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        orderBy,
        orderDir
      };
      
      const response = await designationApi.getAllDesignations();
      if (response.success) {
        setDesignations(response.data);
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAllDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [currentPage, searchTerm, orderBy, orderDir]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'department_id' ? (value === '' ? null : Number(value)) : value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      department_id: null,
      description: '',
      status: 'active'
    });
    setFormErrors({});
    setEditingId(null);
  };

  // Open dialog for create/edit
  const openDialog = (designation?: Designation) => {
    if (designation) {
      setFormData({
        name: designation.name,
        department_id: designation.department_id,
        description: designation.description || '',
        status: designation.status
      });
      setEditingId(designation.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await designationApi.updateDesignation(editingId, formData);
        // Update the designation in the list
        setDesignations(prev => prev.map(d => d.id === editingId ? { ...d, ...formData, updated_at: new Date().toISOString() } : d));
      } else {
        const response = await designationApi.createDesignation(formData);
        // Add new designation to the list
        setDesignations(prev => [response.data, ...prev]);
      }
      
      closeDialog();
      fetchDesignations();
    } catch (error: any) {
      console.error('Error saving designation:', error);
      if (error.message.includes('Validation error')) {
        // Parse validation errors
        const errors: Record<string, string> = {};
        const errorParts = error.message.replace('Validation error: ', '').split('; ');
        errorParts.forEach((part: string) => {
          const [field, message] = part.split(': ');
          if (field && message) {
            errors[field.trim()] = message.trim();
          }
        });
        setFormErrors(errors);
      }
    }
  };

  // Delete designation
  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      await designationApi.deleteDesignation(deletingId);
      setDesignations(prev => prev.filter(d => d.id !== deletingId));
      setTotalItems(prev => prev - 1);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting designation:', error);
    }
  };

  // Confirm delete
  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  // Change page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Sort by column
  const sortBy = (column: string) => {
    if (orderBy === column) {
      setOrderDir(orderDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderBy(column);
      setOrderDir('ASC');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Designations</h1>
          <p className="mt-2 text-gray-600">Manage your organization's job designations</p>
        </div>
        
        <Button 
          onClick={() => openDialog()} 
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Designation
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search designations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Designations List */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => sortBy('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {orderBy === 'name' && (
                            <span>{orderDir === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => sortBy('department_name')}
                      >
                        <div className="flex items-center">
                          Department
                          {orderBy === 'department_name' && (
                            <span>{orderDir === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => sortBy('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {orderBy === 'status' && (
                            <span>{orderDir === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => sortBy('created_at')}
                      >
                        <div className="flex items-center">
                          Created
                          {orderBy === 'created_at' && (
                            <span>{orderDir === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {designations.length > 0 ? (
                        designations.map((designation) => (
                          <motion.tr
                            key={designation.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{designation.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {designation.department_name || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {designation.description || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={designation.status === 'active' ? 'default' : 'secondary'}
                                className={designation.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                              >
                                {designation.status.charAt(0).toUpperCase() + designation.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(designation.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDialog(designation)}
                                >
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => confirmDelete(designation.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No designations found</h3>
                              <p className="text-gray-500">Get started by creating a new designation.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-4">
              <Pagination className="w-full">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
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
                          isActive={currentPage === pageNum}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationEllipsis />
                      <PaginationItem>
                        <PaginationLink onClick={() => goToPage(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="ml-auto text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Create/Edit Designation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Designation' : 'Create New Designation'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter designation name"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department_id">Department</Label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.department_id ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {formErrors.department_id && (
                  <p className="text-sm text-red-500">{formErrors.department_id}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter designation description"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, status: value }));
                    if (formErrors.status) {
                      setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.status;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.status && (
                  <p className="text-sm text-red-500">{formErrors.status}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the designation
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}