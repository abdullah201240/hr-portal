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

  // Add auth token if available - prioritize admin token, fall back to company token
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('adminAuthToken');
    if (!token) {
      token = localStorage.getItem('companyAuthToken');
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
  getAllCompanies: () => makeRequest('/companies'),
  
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