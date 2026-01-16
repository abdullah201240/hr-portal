'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Shield, 
  User, 
  Mail,
  Upload,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';
import { employeeApi, companyDepartmentApi, companyDesignationApi } from '@/lib/api';
import { Employee, EmployeeFormData, Department, Designation } from '@/types/employee';
import Image from 'next/image';

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
    image: employee?.image || '',
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true); // Loading state for options
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

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
      // Prepare form data for submission
      const submitData = { ...formData };
      
      let response;
      if (isEdit) {
        response = await employeeApi.updateEmployee(employee.id, submitData);
      } else {
        response = await employeeApi.createEmployee(submitData);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            image: e.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center">
                  {formData.image ? (
                    <img 
                      src={formData.image.startsWith('data:') ? formData.image : `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${formData.image}`} alt="Profile Preview" className="w-full h-full object-cover"
                      
                       />
                      
                  
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center">
                      <Camera className="h-8 w-8" />
                      <span className="text-xs mt-1">No Image</span>
                    </div>
                  )}
                </div>
                {formData.image && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-500" />
                Upload Photo
              </Label>
              <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    title="Upload Photo" aria-label="Upload Photo"
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full justify-start text-left font-normal glass border-border hover:bg-accent"
                  >
                    {formData.image ? "Change Photo" : "Choose Photo"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground self-center">
                  JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Employee ID <span className="text-red-500">*</span>
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
                Full Name <span className="text-red-500">*</span>
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
                Work Email <span className="text-red-500">*</span>
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
                <Label htmlFor="password" className="text-sm font-semibold">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                    className="h-11 glass border-border focus:ring-emerald-500/50 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
            <Label htmlFor="designation" className="text-sm font-semibold">Designation <span className="text-red-500">*</span></Label>
            <Select value={formData.designation} onValueChange={(value) => handleSelectChange('designation', value)}>
              <SelectTrigger className="h-11 glass border-border" disabled={loadingOptions}>
                <SelectValue placeholder={loadingOptions ? "Loading designations..." : "Select designation"} />
              </SelectTrigger>
              <SelectContent className="glass border-border max-h-60">
                {designations.map((desig: Designation) => (
                  <SelectItem key={desig.id} value={desig.name || desig.id?.toString()}>
                    {desig.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-semibold">Department <span className="text-red-500">*</span></Label>
            <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
              <SelectTrigger className="h-11 glass border-border" disabled={loadingOptions}>
                <SelectValue placeholder={loadingOptions ? "Loading departments..." : "Select department"} />
              </SelectTrigger>
              <SelectContent className="glass border-border max-h-60">
                {departments.map((dept: Department) => (
                  <SelectItem key={dept.id} value={dept.name || dept.id?.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinDate" className="text-sm font-semibold">Join Date <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="salary" className="text-sm font-semibold">Monthly Salary <span className="text-red-500">*</span></Label>
            <Input
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Employee Type <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="phone" className="text-sm font-semibold">Phone Number <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-semibold">Date of Birth <span className="text-red-500">*</span></Label>
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
            <Label className="text-sm font-semibold">Gender <span className="text-red-500">*</span></Label>
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
            <Label className="text-sm font-semibold">Blood Group <span className="text-red-500">*</span></Label>
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
              className="glass border-border focus:ring-emerald-500/50 min-h-20"
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
          className="px-10 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/20 h-11 border-none"
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