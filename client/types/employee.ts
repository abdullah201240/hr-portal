export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  companyId: number;
  designation?: string;
  department?: string;
  maritalStatus?: string;
  currentAddress?: string;
  joinDate?: string;
  salary?: string;
  status?: 'active' | 'inactive';
  employeeType?: string;
  personalMobile?: string;
  emergencyContactNumber?: string;
  bankName?: string;
  accountNumber?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  companyId: number;
  designation?: string;
  department?: string;
  maritalStatus?: string;
  currentAddress?: string;
  joinDate?: string;
  salary?: string;
  status?: 'active' | 'inactive';
  employeeType?: string;
  personalMobile?: string;
  emergencyContactNumber?: string;
  bankName?: string;
  accountNumber?: string;
  image?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
  established_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  industry?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Designation {
  id: number;
  name: string;
  department_id?: number | null;
  department_name?: string | null;
  description?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}