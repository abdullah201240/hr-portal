// lib/api.ts
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
    if (endpoint.includes('/companies') || endpoint.includes('/company')) {
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
          } else if (endpoint.includes('/companies') || endpoint.includes('/company')) {
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