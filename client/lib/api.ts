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
    
    // If endpoint is for companies, use company token
    if (endpoint.includes('/companies') || endpoint.includes('/company') || 
        endpoint.includes('/departments') || endpoint.includes('/designations') ||
        endpoint.includes('/employees') || endpoint.includes('/attendance-policy') ||
        endpoint.includes('/holidays') || endpoint.includes('/leave-policy')) {
      token = localStorage.getItem('companyAuthToken');
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
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('companyAuthToken');
          // If it's an admin endpoint, redirect to admin login
          if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
            localStorage.removeItem('adminProfile');
            window.location.href = '/login/admin';
          } else if (endpoint.includes('/companies') || endpoint.includes('/company') ||
            endpoint.includes('/employees') || endpoint.includes('/departments') || endpoint.includes('/designations') ||
            endpoint.includes('/attendance-policy') || endpoint.includes('/holidays') || endpoint.includes('/leave-policy')) {
            localStorage.removeItem('companyProfile');
            window.location.href = '/login/company';
          } else {
            // For other endpoints, check which token was being used and redirect appropriately
            const adminToken = localStorage.getItem('adminAuthToken');
            const companyToken = localStorage.getItem('companyAuthToken');
            if (adminToken) {
              localStorage.removeItem('adminProfile');
              window.location.href = '/login/admin';
            } else if (companyToken) {
              localStorage.removeItem('companyProfile');
              window.location.href = '/login/company';
            } else {
              window.location.href = '/login';
            }
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

// Employee API functions
export const employeeApi = {
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
      
      return makeRequestWithFormData(`/employees/${id}`, { method: 'PUT', body: formData });
    } else {
      return makeRequest(`/employees/${id}`, { method: 'PUT', body: data });
    }
  },
  
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
    
    // If endpoint is for companies, use company token
    if (endpoint.includes('/companies') || endpoint.includes('/company') || 
        endpoint.includes('/departments') || endpoint.includes('/designations') ||
        endpoint.includes('/employees') || endpoint.includes('/attendance-policy') ||
        endpoint.includes('/holidays') || endpoint.includes('/leave-policy')) {
      token = localStorage.getItem('companyAuthToken');
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
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('companyAuthToken');
          // If it's an admin endpoint, redirect to admin login
          if (endpoint.includes('/admins') || endpoint.includes('/admin')) {
            localStorage.removeItem('adminProfile');
            window.location.href = '/login/admin';
          } else if (endpoint.includes('/companies') || endpoint.includes('/company') ||
            endpoint.includes('/employees') || endpoint.includes('/departments') || endpoint.includes('/designations') ||
            endpoint.includes('/attendance-policy') || endpoint.includes('/holidays') || endpoint.includes('/leave-policy')) {
            localStorage.removeItem('companyProfile');
            window.location.href = '/login/company';
          } else {
            // For other endpoints, check which token was being used and redirect appropriately
            const adminToken = localStorage.getItem('adminAuthToken');
            const companyToken = localStorage.getItem('companyAuthToken');
            if (adminToken) {
              localStorage.removeItem('adminProfile');
              window.location.href = '/login/admin';
            } else if (companyToken) {
              localStorage.removeItem('companyProfile');
              window.location.href = '/login/company';
            } else {
              window.location.href = '/login';
            }
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