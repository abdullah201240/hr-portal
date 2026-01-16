'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companyApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Calendar, Users, Lock, AlertTriangle } from 'lucide-react';
import { Company } from '@/types/company';

interface CompanyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
  const [company, setCompany] = useState<Company | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        
        // Validate the ID before making the API call
        if (!resolvedParams.id) {
          console.error('No company ID provided');
          toast.error('No company ID provided');
          router.push('/admin/companies');
          return;
        }
        
        // Ensure params.id is a string before processing
        const idStr = String(resolvedParams.id).trim();
        const id = parseInt(idStr, 10);
        
        if (isNaN(id) || id <= 0) {
          console.error('Invalid company ID:', resolvedParams.id);
          toast.error('Invalid company ID');
          router.push('/admin/companies');
          return;
        }
        
        setCompanyId(id);
      } catch (error) {
        console.error('Error resolving params:', error);
        toast.error('Failed to load company details');
        router.push('/admin/companies');
      }
    };
    
    resolveParams();
  }, [params, router]);

  useEffect(() => {
    if (companyId === null) return;
    
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await companyApi.getCompanyById(companyId);
        setCompany(response.data);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast.error('Failed to fetch company details');
        router.push('/admin/companies');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [companyId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-background">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Company Not Found
          </h1>
          <p className="text-sm text-muted-foreground/90">The requested company could not be found.</p>
          <Button
            onClick={() => router.push('/admin/companies')}
            className="mt-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-none rounded-none">
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-9 w-9"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-linear-to-br from-emerald-500 to-teal-500 p-3 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{company.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : company.status === 'inactive' 
                          ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20' 
                          : company.status === 'suspended'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                      }`}>
                        {(company.status || 'unknown').charAt(0).toUpperCase() + (company.status || 'unknown').slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">ID: {company.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`/admin/companies/${company.id}/edit`}>
                  <Button className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    Edit Company
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground wrap-break-word">{company.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{company.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p className="text-sm font-medium text-foreground wrap-break-word">
                          {company.website ? (
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              {company.website}
                            </a>
                          ) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm font-medium text-foreground">{company.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Established</p>
                        <p className="text-sm font-medium text-foreground">
                          {company.established_date 
                            ? new Date(company.established_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm font-medium text-foreground">{company.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Administrative Actions */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Administrative Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30"
                      onClick={() => {
                        // Add suspend functionality
                        toast.info('Suspend functionality to be implemented');
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Suspend Company
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30"
                      onClick={() => {
                        // Add reset password functionality
                        toast.info('Reset password functionality to be implemented');
                      }}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}