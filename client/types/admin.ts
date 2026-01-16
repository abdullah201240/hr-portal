// Types for Admin dashboard and related data

export interface CompanyStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export interface AdminStats {
  total: number;
  active: number;
}

export interface RecentActivity {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  action: string;
}

export interface DashboardStats {
  companies: CompanyStats;
  admins: AdminStats;
  recent_activity: RecentActivity[];
}

export interface DashboardData {
  success: boolean;
  data: DashboardStats;
}