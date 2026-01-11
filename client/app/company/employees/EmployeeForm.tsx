'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Shield, 
  User, 
  Mail,
  Briefcase,
  MapPin,
  CreditCard,
  Building
} from 'lucide-react';
import { employeeApi } from '@/lib/api';
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
    sisterConcernId: employee?.sisterConcernId || undefined,
    photo: employee?.photo || '',
    nid: employee?.nid || '',
    nidPhoto: employee?.nidPhoto || '',
    tinNumber: employee?.tinNumber || '',
    designation: employee?.designation || '',
    department: employee?.department || '',
    maritalStatus: employee?.maritalStatus || '',
    spouseName: employee?.spouseName || '',
    spouseNid: employee?.spouseNid || '',
    spouseNidPhoto: employee?.spouseNidPhoto || '',
    marriageCertificate: employee?.marriageCertificate || '',
    currentAddress: employee?.currentAddress || '',
    permanentAddress: employee?.permanentAddress || '',
    joinDate: employee?.joinDate || '',
    salary: employee?.salary || '',
    status: employee?.status || 'active',
    employeeType: employee?.employeeType || '',
    isFreedomFighter: employee?.isFreedomFighter || false,
    freedomFighterDoc: employee?.freedomFighterDoc || '',
    isThirdGender: employee?.isThirdGender || false,
    thirdGenderDoc: employee?.thirdGenderDoc || '',
    hasPF: employee?.hasPF || false,
    nameBangla: employee?.nameBangla || '',
    fatherName: employee?.fatherName || '',
    fatherNameBangla: employee?.fatherNameBangla || '',
    motherName: employee?.motherName || '',
    motherNameBangla: employee?.motherNameBangla || '',
    religion: employee?.religion || '',
    personalMobile: employee?.personalMobile || '',
    personalEmail: employee?.personalEmail || '',
    emergencyContactName: employee?.emergencyContactName || '',
    emergencyContactRelation: employee?.emergencyContactRelation || '',
    emergencyContactNumber: employee?.emergencyContactNumber || '',
    bankName: employee?.bankName || '',
    bankBranch: employee?.bankBranch || '',
    accountNumber: employee?.accountNumber || '',
    accountType: employee?.accountType || '',
    routingNumber: employee?.routingNumber || '',
    swiftCode: employee?.swiftCode || '',
    ibanNumber: employee?.ibanNumber || '',
    bankStatement: employee?.bankStatement || '',
  });

  const [loading, setLoading] = useState(false);

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
      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 border-dashed">
          <div className="relative group">
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-emerald-500/20 mb-4 overflow-hidden border-4 border-white/50">
              {formData.name ? formData.name.charAt(0).toUpperCase() : <Users className="h-16 w-16" />}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Plus className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Click to upload photo</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
        </div>

        <div className="lg:col-span-8 space-y-6">
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
            <Input
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
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
            <Label htmlFor="nid" className="text-sm font-semibold">NID Number</Label>
            <Input
              id="nid"
              name="nid"
              value={formData.nid}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tinNumber" className="text-sm font-semibold">TIN Number</Label>
            <Input
              id="tinNumber"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
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
          <div className="flex items-center space-x-2 pt-8">
            <Switch
              id="isFreedomFighter"
              checked={formData.isFreedomFighter}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFreedomFighter: checked }))}
            />
            <Label htmlFor="isFreedomFighter">Freedom Fighter</Label>
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
          <div className="space-y-2">
            <Label htmlFor="bankBranch" className="text-sm font-semibold">Branch Name</Label>
            <Input
              id="bankBranch"
              name="bankBranch"
              value={formData.bankBranch}
              onChange={handleChange}
              className="h-11 glass border-border focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routingNumber" className="text-sm font-semibold">Routing Number</Label>
            <Input
              id="routingNumber"
              name="routingNumber"
              value={formData.routingNumber}
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