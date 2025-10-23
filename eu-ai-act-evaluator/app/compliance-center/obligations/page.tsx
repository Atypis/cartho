'use client';

/**
 * Obligations Registry Page
 *
 * Flat/grouped list of all obligation instances with filtering
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/compliance/shared/StatusBadge';
import { RiskBadge } from '@/components/compliance/shared/RiskBadge';
import { DueDateBadge } from '@/components/compliance/shared/DueDateBadge';
import { ChevronLeft, Eye, Filter } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type ObligationInstance = Database['public']['Tables']['obligation_instances']['Row'] & {
  use_cases: {
    id: string;
    title: string;
    description: string;
  };
};

export default function ObligationsRegistryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [obligations, setObligations] = useState<ObligationInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [applicabilityFilter, setApplicabilityFilter] = useState<string>('all');
  const [implementationFilter, setImplementationFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check for pre-applied filter from query params
    const filter = searchParams.get('filter');
    if (filter === 'needs-attention') {
      setImplementationFilter('non_compliant');
      setRiskFilter('high');
    }
  }, [searchParams]);

  useEffect(() => {
    loadObligations();
  }, [applicabilityFilter, implementationFilter, riskFilter]);

  const loadObligations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (applicabilityFilter !== 'all') {
        params.append('applicability_state', applicabilityFilter);
      }
      if (implementationFilter !== 'all') {
        params.append('implementation_state', implementationFilter);
      }
      if (riskFilter !== 'all') {
        params.append('risk_level', riskFilter);
      }

      const res = await fetch(`/api/obligations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setObligations(data.obligations);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error loading obligations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredObligations = obligations.filter(obl => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      obl.pn_id.toLowerCase().includes(query) ||
      obl.pn_title?.toLowerCase().includes(query) ||
      obl.use_cases.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/compliance-center')}
              className="mr-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Obligations Registry</h1>
              <p className="text-gray-600 mt-1">
                {total} total obligations ({filteredObligations.length} shown)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <Input
            placeholder="Search by PN ID, title, or use case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={applicabilityFilter} onValueChange={setApplicabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Applicability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applicability</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="applies">Applies</SelectItem>
              <SelectItem value="not_applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
          <Select value={implementationFilter} onValueChange={setImplementationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Implementation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Implementation</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              <SelectItem value="waived">Waived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setApplicabilityFilter('all');
              setImplementationFilter('all');
              setRiskFilter('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredObligations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 mb-4">No obligations found</p>
              <Button onClick={() => router.push('/')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredObligations.map((obligation) => (
              <Card
                key={obligation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/compliance-center/obligations/${obligation.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left: PN and Use Case Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {obligation.pn_id}
                        </h3>
                        {obligation.pn_article && (
                          <span className="text-sm text-gray-500">
                            Article {obligation.pn_article}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium mb-1">
                        {obligation.pn_title || 'No title available'}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Use Case: <span className="font-medium">{obligation.use_cases.title}</span>
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          type="applicability"
                          status={obligation.applicability_state}
                        />
                        {obligation.implementation_state && (
                          <StatusBadge
                            type="implementation"
                            status={obligation.implementation_state}
                          />
                        )}
                        <RiskBadge level={obligation.risk_level} />
                        {obligation.due_date && (
                          <DueDateBadge dueDate={obligation.due_date} />
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="ml-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/compliance-center/obligations/${obligation.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {obligation.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {obligation.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
