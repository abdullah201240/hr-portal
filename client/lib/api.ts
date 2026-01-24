// lib/api.ts
import { Employee, EmployeeFormData } from '@/types/employee';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  skipRedirect?: boolean;  // Add option to skip automatic redirect
}

const makeRequest = async (endpoint: string, options: ApiRequestOptions = {}) => {
  const { method = 'GET', body, headers = {}, skipRedirect = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  // Add auth token if available - choose token based on the endpoint type
  if (typeof window !== 'undefined') {
    let token = null;

    // If endpoint is for companies or employees or attendance, determine the best token
    if (endpoint.includes('/companies') || endpoint.includes('/company') ||
      endpoint.includes('/departments') || endpoint.includes('/designations') ||
      endpoint.includes('/employees') || endpoint.includes('/attendance-policy') ||
      endpoint.includes('/holidays') || endpoint.includes('/leave-policy') ||
      endpoint.includes('/leaves') || endpoint.includes('/attendance') || endpoint.includes('/salary')) {

      // For attendance or employee-specific endpoints, prefer employee token if available
      // BUT if it's a company-specific attendance/leave/salary route, prefer company token
      if ((endpoint.includes('/attendance') || endpoint.includes('/employees/me') || endpoint.includes('/leaves') || endpoint.includes('/salary/payroll/my')) &&
        !endpoint.includes('/company') && !endpoint.includes('/salary/payroll/list') && !endpoint.includes('/salary/stats')) {
        token = localStorage.getItem('employeeAuthToken') || localStorage.getItem('companyAuthToken');
      } else {
        token = localStorage.getItem('companyAuthToken') || localStorage.getItem('employeeAuthToken');
      }
    }
    // If endpoint is for admins, use admin token
    else if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
      token = localStorage.getItem('adminAuthToken');
    }
    // For other endpoints, try admin first then company
    else {
      token = localStorage.getItem('adminAuthToken');
      if (!token) {
        token = localStorage.getItem('companyAuthToken');
      }
    }

    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login') && !skipRedirect) {
        if (typeof window !== 'undefined') {
          console.error(`401 Unauthorized for ${endpoint}. Redirecting to appropriate login.`);

          const isAdmin = !!localStorage.getItem('adminAuthToken');
          const isCompany = !!localStorage.getItem('companyAuthToken');
          const isEmployee = !!localStorage.getItem('employeeAuthToken');

          // If it's an admin endpoint, redirect to admin login
          if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminProfile');
            window.location.href = '/login/admin';
          }
          // If it's an employee or attendance or personal salary endpoint, redirect to employee login
          else if (endpoint.includes('/attendance') || endpoint.includes('/employees/me') ||
            endpoint.includes('/leaves') || endpoint.includes('/leave-policy') || 
            endpoint.includes('/salary/payroll/my') || (isEmployee && !isCompany)) {
            localStorage.removeItem('employeeAuthToken');
            localStorage.removeItem('employeeProfile');
            window.location.href = '/login/employee';
          }
          // If it's a company endpoint or we have a company token
          else if (endpoint.includes('/companies') || endpoint.includes('/company') ||
            endpoint.includes('/employees') || endpoint.includes('/departments') ||
            endpoint.includes('/designations') || endpoint.includes('/salary') || isCompany) {
            localStorage.removeItem('companyAuthToken');
            localStorage.removeItem('companyProfile');
            window.location.href = '/login/company';
          }
          // Default fallback
          else {
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('companyAuthToken');
            localStorage.removeItem('employeeAuthToken');
            window.location.href = '/login';
          }
        }
      }

      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors specifically
      if (response.status === 422 && errorData.errors) {
        // Format validation errors
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        throw new Error(`Validation error: ${validationErrors}`);
      }

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Company API functions
export const companyApi = {
  // Get all companies
  getAllCompanies: (params?: URLSearchParams) => {
    const url = params ? `/companies?${params.toString()}` : '/companies';
    return makeRequest(url);
  },

  // Get a specific company
  getCompanyById: (id: number) => makeRequest(`/companies/${id}`),

  // Create a new company
  createCompany: (data: any) => makeRequest('/companies', { method: 'POST', body: data }),

  // Update a company
  updateCompany: (id: number, data: any) => makeRequest(`/companies/${id}`, { method: 'PUT', body: data }),

  // Delete a company
  deleteCompany: (id: number) => makeRequest(`/companies/${id}`, { method: 'DELETE' }),

  // Login a company
  loginCompany: (credentials: { email: string; password: string }) =>
    makeRequest('/companies/login', { method: 'POST', body: credentials }),

  // Logout a company
  logoutCompany: () => makeRequest('/companies/logout', { method: 'POST', skipRedirect: true }),

  // Get current company profile - skip redirect so profile page can handle auth errors
  getCurrentCompanyProfile: () => makeRequest('/companies/me', { skipRedirect: true }),
};

// Admin API functions
export const adminApi = {
  // Get all admins
  getAllAdmins: () => makeRequest('/admins'),

  // Get a specific admin
  getAdminById: (id: number) => makeRequest(`/admins/${id}`),

  // Create a new admin
  createAdmin: (data: any) => makeRequest('/admins', { method: 'POST', body: data }),

  // Update an admin
  updateAdmin: (id: number, data: any) => makeRequest(`/admins/${id}`, { method: 'PUT', body: data }),

  // Delete an admin
  deleteAdmin: (id: number) => makeRequest(`/admins/${id}`, { method: 'DELETE' }),

  // Login an admin
  loginAdmin: (credentials: { email: string; password: string }) =>
    makeRequest('/admins/login', { method: 'POST', body: credentials }),

  // Logout an admin
  logoutAdmin: () => makeRequest('/admins/logout', { method: 'POST', skipRedirect: true }),

  // Get current admin profile - skip redirect so profile page can handle auth errors
  getCurrentAdminProfile: () => makeRequest('/admins/me', { skipRedirect: true }),

  // Get dashboard statistics
  getDashboardStats: () => makeRequest('/dashboard/stats'),
};

// Department API functions
export const departmentApi = {
  // Get all departments
  getAllDepartments: (params?: URLSearchParams) => {
    const url = params ? `/departments?${params.toString()}` : '/departments';
    return makeRequest(url);
  },

  // Get a specific department
  getDepartmentById: (id: number) => makeRequest(`/departments/${id}`),

  // Create a new department
  createDepartment: (data: any) => makeRequest('/departments', { method: 'POST', body: data }),

  // Update a department
  updateDepartment: (id: number, data: any) => makeRequest(`/departments/${id}`, { method: 'PUT', body: data }),

  // Delete a department
  deleteDepartment: (id: number) => makeRequest(`/departments/${id}`, { method: 'DELETE' }),
};

// Designation API functions
export const designationApi = {
  // Get all designations
  getAllDesignations: (params?: URLSearchParams) => {
    const url = params ? `/designations?${params.toString()}` : '/designations';
    return makeRequest(url);
  },

  // Get a specific designation
  getDesignationById: (id: number) => makeRequest(`/designations/${id}`),

  // Create a new designation
  createDesignation: (data: any) => makeRequest('/designations', { method: 'POST', body: data }),

  // Update a designation
  updateDesignation: (id: number, data: any) => makeRequest(`/designations/${id}`, { method: 'PUT', body: data }),

  // Delete a designation
  deleteDesignation: (id: number) => makeRequest(`/designations/${id}`, { method: 'DELETE' }),
};

// Policy API functions
export const attendanceApi = {
  getStatus: () => makeRequest('/attendance/status'),
  clockIn: () => makeRequest('/attendance/clock-in', { method: 'POST' }),
  clockOut: () => makeRequest('/attendance/clock-out', { method: 'POST' }),

  getHistory: (params?: { limit?: number; month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.month) searchParams.append('month', params.month.toString());
    if (params?.year) searchParams.append('year', params.year.toString());
    
    const url = searchParams.toString() ? `/attendance/history?${searchParams.toString()}` : '/attendance/history';
    return makeRequest(url);
  },
  getCompanyAttendance: (date?: string) => {
    const url = date ? `/attendance/company?date=${date}` : '/attendance/company';
    return makeRequest(url);
  },
  getCompanyMonthlyAttendance: (params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.append('month', params.month.toString());
    if (params?.year) searchParams.append('year', params.year.toString());
    
    const url = searchParams.toString() ? `/attendance/company/monthly?${searchParams.toString()}` : '/attendance/company/monthly';
    return makeRequest(url);
  },
};

export const policyApi = {
  getAttendancePolicy: () => makeRequest('/attendance-policy'),
  saveAttendancePolicy: (data: any) => makeRequest('/attendance-policy', { method: 'POST', body: data }),
};

// Holiday API functions
export const holidayApi = {
  getHolidays: (year?: number) => {
    const url = year ? `/holidays?year=${year}` : '/holidays';
    return makeRequest(url);
  },
  saveHoliday: (data: { name: string; date: string }) => makeRequest('/holidays', { method: 'POST', body: data }),
  deleteHoliday: (id: number) => makeRequest(`/holidays/${id}`, { method: 'DELETE' }),
};

// Leave Policy API functions
export const leavePolicyApi = {
  getLeavePolicies: () => makeRequest('/leave-policy'),
  syncLeavePolicies: (data: any[]) => makeRequest('/leave-policy', { method: 'POST', body: data }),
};

// Leave API functions
export const leaveApi = {
  applyLeave: (data: any) => makeRequest('/leaves/apply', { method: 'POST', body: data }),
  getMyLeaves: () => makeRequest('/leaves/my'),
  getPendingApprovals: () => makeRequest('/leaves/pending'),
  getCompanyLeaves: () => makeRequest('/leaves/company'),
  updateLeaveStatus: (id: number, status: 'approved' | 'rejected', managerNote?: string) =>
    makeRequest(`/leaves/${id}/status`, { method: 'POST', body: { status, manager_note: managerNote } }),
};

// Salary API functions
export const salaryApi = {
  getHistory: (employeeId: number) => makeRequest(`/salary/history/${employeeId}`),
  getAllHistory: () => makeRequest('/salary/all'),
  getStats: () => makeRequest('/salary/stats'),
  generatePayroll: (data: { month: number; year: number; force?: boolean }) =>
    makeRequest('/salary/payroll/generate', { method: 'POST', body: data }),
  getPayrollList: (params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.append('month', params.month.toString());
    if (params?.year) searchParams.append('year', params.year.toString());
    const url = searchParams.toString() ? `/salary/payroll/list?${searchParams.toString()}` : '/salary/payroll/list';
    return makeRequest(url);
  },
  getPayoutDetails: (id: number) => makeRequest(`/salary/payroll/${id}`),
  updatePayoutStatus: (data: { ids: number[]; status: 'paid' | 'pending'; payment_date?: string; method?: string }) =>
    makeRequest('/salary/payroll/status', { method: 'POST', body: data }),
  getMyPayouts: () => makeRequest('/salary/payroll/my'),
  bulkUpdateSalaries: (data: { updates: { employee_id: number; salary: number }[]; reason?: string }) =>
    makeRequest('/salary/bulk-update', { method: 'POST', body: data }),
  addIncrement: (data: {
    employee_id: number;
    increment_date: string;
    new_salary?: number;
    increment_amount?: number;
    increment_percentage?: number;
    reason?: string;
  }) => makeRequest('/salary/increment', { method: 'POST', body: data }),
};

// Employee API functions
export const employeeApi = {
  login: (credentials: any) => makeRequest('/employees/login', { method: 'POST', body: credentials }),
  getProfile: () => makeRequest('/employees/me', { skipRedirect: true }),
  // Get all employees
  getAllEmployees: (params?: { page?: number; limit?: number; search?: string; orderBy?: string; orderDir?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.orderBy) searchParams.append('orderBy', params.orderBy);
    if (params?.orderDir) searchParams.append('orderDir', params.orderDir);

    const url = searchParams.toString() ? `/employees?${searchParams.toString()}` : '/employees';
    return makeRequest(url);
  },

  // Get a specific employee
  getEmployeeById: (id: number) => makeRequest(`/employees/${id}`),

  // Create a new employee
  createEmployee: (data: EmployeeFormData) => {
    // If image is present and is a data URL, we need to handle it differently
    if (data.image && typeof data.image === 'string' && data.image.startsWith('data:')) {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all other fields
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (key !== 'image' && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Handle image separately
      if (data.image) {
        // Convert data URL to Blob
        const blob = dataURLToBlob(data.image);
        formData.append('image', blob, 'employee_image.jpg');
      }

      return makeRequestWithFormData('/employees', { method: 'POST', body: formData });
    } else {
      return makeRequest('/employees', { method: 'POST', body: data });
    }
  },

  // Update an employee
  updateEmployee: (id: number, data: Partial<EmployeeFormData>) => {
    // If image is present and is a data URL, we need to handle it differently
    if (data.image && typeof data.image === 'string' && data.image.startsWith('data:')) {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all other fields
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (key !== 'image' && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Handle image separately
      if (data.image) {
        // Convert data URL to Blob
        const blob = dataURLToBlob(data.image);
        formData.append('image', blob, 'employee_image.jpg');
      }

      return makeRequestWithFormData(`/employees/${id}`, { method: 'POST', body: formData });
    } else {
      return makeRequest(`/employees/${id}`, { method: 'PUT', body: data });
    }
  },

  verifyPassword: (password: string) =>
    makeRequest('/employees/verify-password', { method: 'POST', body: { password } }),

  changePassword: (newPassword: string) =>
    makeRequest('/employees/change-password', { method: 'POST', body: { new_password: newPassword } }),

  // Delete an employee
  deleteEmployee: (id: number) => makeRequest(`/employees/${id}`, { method: 'DELETE' }),
};

// Helper function to convert data URL to Blob
function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Function to make request with FormData (for file uploads)
const makeRequestWithFormData = async (endpoint: string, options: Omit<ApiRequestOptions, 'headers'> = {}) => {
  const { method = 'GET', body } = options;

  const config: RequestInit = {
    method,
    body: body as BodyInit,
    // Don't set Content-Type header for FormData, let the browser set it with the correct boundary
  };

  // Add auth token if available - choose token based on the endpoint type
  if (typeof window !== 'undefined') {
    let token = null;

    // If endpoint is for companies or employees or attendance, determine the best token
    if (endpoint.includes('/companies') || endpoint.includes('/company') ||
      endpoint.includes('/departments') || endpoint.includes('/designations') ||
      endpoint.includes('/employees') || endpoint.includes('/attendance-policy') ||
      endpoint.includes('/holidays') || endpoint.includes('/leave-policy') ||
      endpoint.includes('/leaves') || endpoint.includes('/attendance')) {

      // For attendance or employee-specific endpoints, prefer employee token if available
      if (endpoint.includes('/attendance') || endpoint.includes('/employees/me') || endpoint.includes('/leaves')) {
        token = localStorage.getItem('employeeAuthToken') || localStorage.getItem('companyAuthToken');
      } else {
        token = localStorage.getItem('companyAuthToken') || localStorage.getItem('employeeAuthToken');
      }
    }
    // If endpoint is for admins, use admin token
    else if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
      token = localStorage.getItem('adminAuthToken');
    }
    // For other endpoints, try admin first then company
    else {
      token = localStorage.getItem('adminAuthToken');
      if (!token) {
        token = localStorage.getItem('companyAuthToken');
      }
    }

    if (token) {
      (config.headers as Record<string, string>) = { Authorization: `Bearer ${token}` };
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login') && !options.skipRedirect) {
        if (typeof window !== 'undefined') {
          console.error(`401 Unauthorized for ${endpoint}. Redirecting to appropriate login.`);

          const isAdmin = !!localStorage.getItem('adminAuthToken');
          const isCompany = !!localStorage.getItem('companyAuthToken');
          const isEmployee = !!localStorage.getItem('employeeAuthToken');

          // If it's an admin endpoint, redirect to admin login
          if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminProfile');
            window.location.href = '/login/admin';
          }
          // If it's an employee or attendance or personal salary endpoint, redirect to employee login
          else if (endpoint.includes('/attendance') || endpoint.includes('/employees/me') ||
            endpoint.includes('/leaves') || endpoint.includes('/leave-policy') || 
            endpoint.includes('/salary/payroll/my') || (isEmployee && !isCompany)) {
            localStorage.removeItem('employeeAuthToken');
            localStorage.removeItem('employeeProfile');
            window.location.href = '/login/employee';
          }
          // If it's a company endpoint or we have a company token
          else if (endpoint.includes('/companies') || endpoint.includes('/company') ||
            endpoint.includes('/employees') || endpoint.includes('/departments') ||
            endpoint.includes('/designations') || endpoint.includes('/salary') || isCompany) {
            localStorage.removeItem('companyAuthToken');
            localStorage.removeItem('companyProfile');
            window.location.href = '/login/company';
          }
          // Default fallback
          else {
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('companyAuthToken');
            localStorage.removeItem('employeeAuthToken');
            window.location.href = '/login';
          }
        }
      }

      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors specifically
      if (response.status === 422 && errorData.errors) {
        // Format validation errors
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        throw new Error(`Validation error: ${validationErrors}`);
      }

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Company Department API functions
export const companyDepartmentApi = {
  // Get all departments for the current company
  getAllDepartments: (params?: URLSearchParams) => {
    const url = params ? `/departments?${params.toString()}` : '/departments';
    return makeRequest(url);
  },

  // Get a specific department
  getDepartmentById: (id: number) => makeRequest(`/departments/${id}`),

  // Create a new department
  createDepartment: (data: any) => makeRequest('/departments', { method: 'POST', body: data }),

  // Update a department
  updateDepartment: (id: number, data: any) => makeRequest(`/departments/${id}`, { method: 'PUT', body: data }),

  // Delete a department
  deleteDepartment: (id: number) => makeRequest(`/departments/${id}`, { method: 'DELETE' }),
};

// Company Designation API functions
export const companyDesignationApi = {
  // Get all designations for the current company
  getAllDesignations: (params?: URLSearchParams) => {
    const url = params ? `/designations?${params.toString()}` : '/designations';
    return makeRequest(url);
  },

  // Get a specific designation
  getDesignationById: (id: number) => makeRequest(`/designations/${id}`),

  // Create a new designation
  createDesignation: (data: any) => makeRequest('/designations', { method: 'POST', body: data }),

  // Update a designation
  updateDesignation: (id: number, data: any) => makeRequest(`/designations/${id}`, { method: 'PUT', body: data }),

  // Delete a designation
  deleteDesignation: (id: number) => makeRequest(`/designations/${id}`, { method: 'DELETE' }),
};

// Company Dashboard API functions
export const companyDashboardApi = {
  // Get company dashboard statistics
  getDashboardStats: () => companyAnalyticsApi.getCompanyStats(),
};

// Role Management API functions
export const roleApi = {
  // Roles CRUD
  getAllRoles: () => makeRequest('/roles'),
  createRole: (data: any) => makeRequest('/roles', { method: 'POST', body: data }),
  updateRole: (id: number, data: any) => makeRequest(`/roles/${id}`, { method: 'PUT', body: data }),
  deleteRole: (id: number) => makeRequest(`/roles/${id}`, { method: 'DELETE' }),
  
  // Role Permissions
  getRolePermissions: (roleId: number) => makeRequest(`/roles/${roleId}/permissions`),
  updateRolePermissions: (roleId: number, data: any) => makeRequest(`/roles/${roleId}/permissions`, { method: 'POST', body: data }),
  
  // Role Assignments
  assignRoleToEmployee: (data: { employee_id: number; role_id: number }) => makeRequest('/roles/assign', { method: 'POST', body: data }),
  removeRoleFromEmployee: (data: { employee_id: number; role_id: number }) => makeRequest('/roles/remove', { method: 'POST', body: data }),
  
  // Employee Roles
  getEmployeeRoles: (employeeId: number) => makeRequest(`/employees/${employeeId}/roles`),
  getRoleEmployees: (roleId: number) => makeRequest(`/roles/${roleId}/employees`),
  
  // Permission Checking
  checkEmployeePermission: (data: { employee_id?: number; feature_key: string; permission_type: string }) => makeRequest('/permissions/check', { method: 'POST', body: data }),
};

// Company Analytics API functions
export const companyAnalyticsApi = {
  // Get company-wide analytics and statistics
  getCompanyAnalytics: () => makeRequest('/salary/analytics'),
  
  // Get company statistics
  getCompanyStats: () => makeRequest('/salary/stats'),
  
  // Get recent activity
  getRecentActivity: () => makeRequest('/salary/activity'),
  
  // Get company attendance analytics
  getAttendanceAnalytics: (params?: { month?: number; year?: number }) => attendanceApi.getCompanyMonthlyAttendance(params),
  
  // Get employee demographics
  getEmployeeDemographics: () => makeRequest('/employees/analytics'),
};