'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { companyApi } from '@/lib/api';

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companyApi.getAllCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (id: number, newStatus: string) => {
    try {
      await companyApi.updateCompany(id, { status: newStatus });
      // Refresh the list
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Companies</h1>
        <Button>Add New Company</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Companies List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b">
                    <td className="py-3 px-4">{company.name}</td>
                    <td className="py-3 px-4">{company.email}</td>
                    <td className="py-3 px-4">{company.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          company.status === 'active' ? 'default' : 
                          company.status === 'inactive' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateCompanyStatus(company.id, 'active')}
                          disabled={company.status === 'active'}
                        >
                          Activate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateCompanyStatus(company.id, 'inactive')}
                          disabled={company.status === 'inactive'}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}