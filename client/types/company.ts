export interface Company {
  id: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
  established_date?: string; // YYYY-MM-DD format
  status?: 'active' | 'inactive' | 'suspended';
  industry?: string;
  created_at?: string;
  updated_at?: string;
  founded_year?: string; // For backward compatibility with the form
  employee_count?: string; // For backward compatibility with the form
}