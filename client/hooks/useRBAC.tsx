// client/hooks/useRBAC.ts

import { useState, useEffect } from 'react';
import { roleApi } from '@/lib/api';
import { useEmployeeAuth } from './useEmployeeAuth';

interface PermissionCheck {
  feature_key: string;
  permission_type: 'can_view' | 'can_create' | 'can_edit' | 'can_delete';
}

export function useRBAC() {
  const { employeeProfile } = useEmployeeAuth();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeProfile?.id) {
      fetchEmployeePermissions();
    }
  }, [employeeProfile?.id]);

  const fetchEmployeePermissions = async () => {
    try {
      setLoading(true);
      // This would call an endpoint to get all permissions for the current employee
      // For now, we'll implement a basic version
      setPermissions([]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (featureKey: string, permissionType: string): boolean => {
    if (!employeeProfile?.id) return false;
    
    // For company admins, grant all permissions
    if (typeof window !== 'undefined') {
      const companyToken = localStorage.getItem('companyAuthToken');
      if (companyToken) return true;
    }

    // Check if employee has the specific permission
    return permissions.some(
      perm => perm.feature_key === featureKey && perm[permissionType] === true
    );
  };

  const canView = (featureKey: string): boolean => hasPermission(featureKey, 'can_view');
  const canCreate = (featureKey: string): boolean => hasPermission(featureKey, 'can_create');
  const canEdit = (featureKey: string): boolean => hasPermission(featureKey, 'can_edit');
  const canDelete = (featureKey: string): boolean => hasPermission(featureKey, 'can_delete');

  return {
    permissions,
    loading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    refreshPermissions: fetchEmployeePermissions
  };
}

// Higher-order component for protecting routes/components
export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: { feature_key: string; permission_type: string }
) {
  return function RBACWrapper(props: P) {
    const { hasPermission, loading } = useRBAC();
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      );
    }

    if (!hasPermission(requiredPermission.feature_key, requiredPermission.permission_type)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="text-center p-8 rounded-lg glass border border-red-500/20 max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this feature.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Custom hook for checking multiple permissions
export function useMultiplePermissions(permissions: PermissionCheck[]) {
  const { hasPermission } = useRBAC();
  
  const results = permissions.reduce((acc, perm) => {
    acc[`${perm.feature_key}_${perm.permission_type}`] = 
      hasPermission(perm.feature_key, perm.permission_type);
    return acc;
  }, {} as Record<string, boolean>);
  
  return results;
}