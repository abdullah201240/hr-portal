'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types/employee';
import { 
  Users, 
  ChevronDown, 
  ChevronRight, 
  User,
  Briefcase,
  Mail,
  Phone,
  Building,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TreeNode extends Employee {
  children: TreeNode[];
}

const EmployeeCard = ({ employee, isCollapsed, onToggle }: { employee: TreeNode; isCollapsed: boolean; onToggle: () => void }) => {
  const hasChildren = employee.children.length > 0;
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-3 glass-strong border border-border rounded-xl hover:border-emerald-500/50 transition-all group relative">
        <div className="flex items-center gap-3 flex-1">
          {hasChildren && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 hover:bg-emerald-500/10 rounded-md text-muted-foreground hover:text-emerald-500 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 overflow-hidden bg-emerald-500/10 flex items-center justify-center shrink-0">
            {employee.image ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${employee.image.replace(/^\/+/, '')}`} 
                alt={employee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-emerald-600 font-bold text-sm">
                {employee.name.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">{employee.name}</h4>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Briefcase size={10} className="text-emerald-500" />
              {employee.designation || 'No Designation'}
            </p>
          </div>
        </div>
        
        <div className="hidden group-hover:flex items-center gap-2 pr-2">
           <div className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
             {employee.employeeId}
           </div>
        </div>
      </div>
      
      {!isCollapsed && hasChildren && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-emerald-500/10 pl-6 relative">
          {employee.children.map((child) => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNodeComponent = ({ node }: { node: TreeNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <EmployeeCard 
      employee={node} 
      isCollapsed={isCollapsed} 
      onToggle={() => setIsCollapsed(!isCollapsed)} 
    />
  );
};

export default function HierarchyPage() {
  const { isAuthenticated, isLoading: authLoading } = useCompanyAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login/company');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await employeeApi.getAllEmployees({ limit: 1000 });
        if (response.success) {
          const allEmployees = response.data || [];
          setEmployees(allEmployees);
          
          // Build hierarchy tree
          const buildTree = (items: Employee[], parentId: number | null = null): TreeNode[] => {
            return items
              .filter(item => item.line_manager_id === parentId)
              .map(item => ({
                ...item,
                children: buildTree(items, item.id)
              }));
          };
          
          const tree = buildTree(allEmployees);
          setTreeData(tree);
        }
      } catch (error) {
        console.error('Error fetching hierarchy data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-emerald-500" />
            Employee Hierarchy
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visual representation of your company's reporting structure.
          </p>
        </div>
      </div>

      <Card className="glass border-border shadow-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-500" />
            Organization Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {treeData.length > 0 ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {treeData.map((rootNode) => (
                <TreeNodeComponent key={rootNode.id} node={rootNode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-emerald-500/5 rounded-2xl border-2 border-dashed border-emerald-500/20">
              <Users className="h-12 w-12 text-emerald-500/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No employees found in the hierarchy.</p>
              <p className="text-xs text-muted-foreground mt-2">Make sure you have registered employees and assigned line managers.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
