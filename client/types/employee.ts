export interface Child {
  id?: number;
  name: string;
  dob?: string;
  gender?: string;
}

export interface Nominee {
  id?: number;
  name: string;
  relation: string;
  nid?: string;
  percentage: number;
}

export interface LineManager {
  id?: number;
  name: string;
  employeeId: string;
  designation?: string;
  department?: string;
}

export interface EmployeeTypeHistoryItem {
  id?: number;
  employeeType: 'full-time' | 'part-time' | 'contract' | 'intern';
  changeDate: string;
  reason?: string;
}

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
  sisterConcernId?: number;
  photo?: string;
  nid?: string;
  nidPhoto?: string;
  tinNumber?: string;
  designation?: string;
  department?: string;
  maritalStatus?: string;
  spouseName?: string;
  spouseNid?: string;
  spouseNidPhoto?: string;
  marriageCertificate?: string;
  children?: Child[];
  nominee?: Nominee;
  lineManager?: LineManager;
  currentAddress?: string;
  permanentAddress?: string;
  joinDate?: string;
  salary?: string;
  status?: 'active' | 'inactive';
  employeeType?: string;
  employeeTypeChangeDate?: string;
  employeeTypeHistory?: EmployeeTypeHistoryItem[];
  isFreedomFighter?: boolean;
  freedomFighterDoc?: string;
  isThirdGender?: boolean;
  thirdGenderDoc?: string;
  hasPF?: boolean;
  nameBangla?: string;
  fatherName?: string;
  fatherNameBangla?: string;
  motherName?: string;
  motherNameBangla?: string;
  religion?: string;
  personalMobile?: string;
  personalEmail?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactNumber?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountType?: string;
  routingNumber?: string;
  swiftCode?: string;
  ibanNumber?: string;
  bankStatement?: string;
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
  sisterConcernId?: number;
  photo?: string | File;
  nid?: string;
  nidPhoto?: string | File;
  tinNumber?: string;
  designation?: string;
  department?: string;
  maritalStatus?: string;
  spouseName?: string;
  spouseNid?: string;
  spouseNidPhoto?: string | File;
  marriageCertificate?: string | File;
  currentAddress?: string;
  permanentAddress?: string;
  joinDate?: string;
  salary?: string;
  status?: 'active' | 'inactive';
  employeeType?: string;
  isFreedomFighter?: boolean;
  freedomFighterDoc?: string | File;
  isThirdGender?: boolean;
  thirdGenderDoc?: string | File;
  hasPF?: boolean;
  nameBangla?: string;
  fatherName?: string;
  fatherNameBangla?: string;
  motherName?: string;
  motherNameBangla?: string;
  religion?: string;
  personalMobile?: string;
  personalEmail?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactNumber?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountType?: string;
  routingNumber?: string;
  swiftCode?: string;
  ibanNumber?: string;
  bankStatement?: string | File;
}