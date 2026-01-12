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