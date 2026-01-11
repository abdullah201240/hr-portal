'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Shield, 
  User, 
  Mail,
} from 'lucide-react';
import { employeeApi, companyDepartmentApi, companyDesignationApi } from '@/lib/api';
import { Employee, EmployeeFormData } from '@/types/employee';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess }) => {
  const isEdit = !!employee;
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: employee?.employeeId || '',
    name: employee?.name || '',
    email: employee?.email || '',
    password: '',
    phone: employee?.phone || '',
    dob: employee?.dob || '',
    gender: employee?.gender || '',
    bloodGroup: employee?.bloodGroup || '',
    companyId: employee?.companyId || parseInt(localStorage.getItem('companyId') || '0'),
    designation: employee?.designation || '',
    department: employee?.department || '',
    maritalStatus: employee?.maritalStatus || '',
    currentAddress: employee?.currentAddress || '',
    joinDate: employee?.joinDate || '',
    salary: employee?.salary || '',
    status: employee?.status || 'active',
    employeeType: employee?.employeeType || '',
    personalMobile: employee?.personalMobile || '',
    emergencyContactNumber: employee?.emergencyContactNumber || '',
    bankName: employee?.bankName || '',
    accountNumber: employee?.accountNumber || '',
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true); // Loading state for options

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptResponse, desigResponse] = await Promise.all([
          companyDepartmentApi.getAllDepartments(),
          companyDesignationApi.getAllDesignations()
        ]);
        
        if (deptResponse.success) {
          setDepartments(deptResponse.data || []);
        }
        if (desigResponse.success) {
          setDesignations(desigResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching departments/designations:', error);
        toast.error('Failed to load departments and designations');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isEdit) {
        response = await employeeApi.updateEmployee(employee.id, formData);
      } else {
        response = await employeeApi.createEmployee(formData);
      }

      if (response.success) {
        toast.success(response.message || `Employee ${isEdit ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        toast.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} employee:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} employee`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Employee ID *
              </Label>
              <Input
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP-001"
                required
                className="h-11 glass border-border focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                Full Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="h-11 glass border-border focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                Work Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                required
                className="h-11 glass border-border focus:ring-emerald-500/50"
              />
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="h-11 glass border-border focus:ring-emerald-500/50"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Employment Details</h3>
          <p className="text-sm text-muted-foreground">Information about the role and department.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-sm font-semibold">Designation</Label>
            <Select value={formData.designation} onValueChange={(value) => handleSelectChange('designation', value)}>
              <SelectTrigger className="h-11 glass border-border" disabled={loadingOptions}>
                <SelectValue placeholder={loadingOptions ? "Loading designations..." : "Select designation"} />
              </SelectTrigger>
              <SelectContent className="glass border-border max-h-60">
                {designations.map((desig) => (
                  <SelectItem key={desig.id} value={desig.name || desig.id?.toString()}>
                    {desig.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
              <SelectTrigger className="h-11 glass border-border" disabled={loadingOptions}>
                <SelectValue placeholder={loadingOptions ? "Loading departments..." : "Select department"} />
              </SelectTrigger>
              <SelectContent className="glass border-border max-h-60">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name || dept.id?.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinDate" className="text-sm font-semibold">Join Date</Label>
            <Input
              id="joinDate"
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-sm font-semibold">Monthly Salary</Label>
            <Input
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Employee Type</Label>
            <Select value={formData.employeeType} onValueChange={(value) => handleSelectChange('employeeType', value)}>
              <SelectTrigger className="h-11 glass border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
          <p className="text-sm text-muted-foreground">Identity and personal information.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-semibold">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
              <SelectTrigger className="h-11 glass border-border">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => handleSelectChange('bloodGroup', value)}>
              <SelectTrigger className="h-11 glass border-border">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Identification & Status</h3>
          <p className="text-sm text-muted-foreground">National identity and marital status.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Marital Status</Label>
            <Select value={formData.maritalStatus} onValueChange={(value) => handleSelectChange('maritalStatus', value)}>
              <SelectTrigger className="h-11 glass border-border">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Address & Contact</h3>
          <p className="text-sm text-muted-foreground">Where the employee can be reached.</p>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentAddress" className="text-sm font-semibold">Current Address</Label>
            <Textarea
              id="currentAddress"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
              className="glass border-border focus:ring-emerald-500/50 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="personalMobile" className="text-sm font-semibold">Personal Mobile</Label>
              <Input
                id="personalMobile"
                name="personalMobile"
                value={formData.personalMobile}
                onChange={handleChange}
                className="h-11 glass border-border focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactNumber" className="text-sm font-semibold">Emergency Contact</Label>
              <Input
                id="emergencyContactNumber"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="h-11 glass border-border focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Bank Information</h3>
          <p className="text-sm text-muted-foreground">Salary disbursement details.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-semibold">Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-semibold">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-10 border-t border-white/10">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onSuccess}
          className="px-8 hover:bg-white/5"
        >
          Discard
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="px-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/20 h-11 border-none"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            isEdit ? 'Update Changes' : 'Register Employee'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;