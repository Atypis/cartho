'use client';

/**
 * Obligations Registry Page (Table-Based Accordion)
 *
 * Use-case-centric view with expandable rows showing obligations
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/compliance/shared/StatusBadge';
import { RiskBadge } from '@/components/compliance/shared/RiskBadge';
import { DueDateBadge } from '@/components/compliance/shared/DueDateBadge';
import { ChevronLeft, ChevronDown, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type ObligationInstance = Database['public']['Tables']['obligation_instances']['Row'];

interface UseCaseWithObligations {
  use_case_id: string;
  use_case_title: string;
  use_case_description: string;
  obligations: ObligationInstance[];
  summary: {
    total_applicable: number;
    compliant: number;
    in_progress: number;
    non_compliant: number;
    not_started: number;
    high_risk_issues: number;
    critical_risk_issues: number;
  };
}

export default function ObligationsRegistryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [useCases, setUseCases] = useState<UseCaseWithObligations[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUseCases, setExpandedUseCases] = useState<Set<string>>(new Set());

  // Filters
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [implementationFilter, setImplementationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNA, setShowNA] = useState(false);

  useEffect(() => {
    // Check for pre-applied filter from query params
    const filter = searchParams.get('filter');
    if (filter === 'needs-attention') {
      setImplementationFilter('non_compliant');
      setRiskFilter('high');
    }
  }, [searchParams]);

  useEffect(() => {
    loadUseCases();
  }, [riskFilter, implementationFilter, showNA]);

  const loadUseCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showNA) {
        params.append('include_na', 'true');
      }
      if (riskFilter !== 'all') {
        params.append('risk_level', riskFilter);
      }
      if (implementationFilter !== 'all') {
        params.append('implementation_state', implementationFilter);
      }

      const res = await fetch(`/api/obligations/by-use-case?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUseCases(data.use_cases);
      }
    } catch (error) {
      console.error('Error loading use cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUseCase = (useCaseId: string) => {
    setExpandedUseCases(prev => {
      const next = new Set(prev);
      if (next.has(useCaseId)) {
        next.delete(useCaseId);
      } else {
        next.add(useCaseId);
      }
      return next;
    });
  };

  const filteredUseCases = useCases.filter(uc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      uc.use_case_title.toLowerCase().includes(query) ||
      uc.use_case_description.toLowerCase().includes(query) ||
      uc.obligations.some(obl =>
        obl.pn_id.toLowerCase().includes(query) ||
        obl.pn_title?.toLowerCase().includes(query)
      )
    );
  });

  const getComplianceRate = (summary: UseCaseWithObligations['summary']) => {
    if (summary.total_applicable === 0) return 0;
    return Math.round((summary.compliant / summary.total_applicable) * 100);
  };

  return (
    <SidebarInset>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/compliance-center')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Obligations Registry</h1>
                <p className="text-gray-600 mt-1">
                  {filteredUseCases.length} use case{filteredUseCases.length !== 1 ? 's' : ''} with applicable obligations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <Input
              placeholder="Search use cases or obligations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
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
              size="sm"
              onClick={() => setShowNA(!showNA)}
              className={showNA ? 'bg-blue-50' : ''}
            >
              {showNA ? 'Hide' : 'Show'} N/A
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImplementationFilter('all');
                setRiskFilter('all');
                setSearchQuery('');
                setShowNA(false);
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
          ) : filteredUseCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border">
              <p className="text-gray-600 mb-4">No use cases with obligations found</p>
              <Button onClick={() => router.push('/')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[300px]">Use Case</TableHead>
                    <TableHead className="text-center w-[100px]">Obligations</TableHead>
                    <TableHead className="w-[200px]">Compliance Rate</TableHead>
                    <TableHead className="w-[250px]">Status Summary</TableHead>
                    <TableHead className="text-center w-[150px]">Risk Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUseCases.map((uc) => {
                    const isExpanded = expandedUseCases.has(uc.use_case_id);
                    const complianceRate = getComplianceRate(uc.summary);

                    return (
                      <React.Fragment key={uc.use_case_id}>
                        {/* Main Row */}
                        <TableRow
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleUseCase(uc.use_case_id)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="font-semibold text-gray-900 truncate">
                                {uc.use_case_title}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {uc.use_case_description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-semibold text-gray-900">
                              {uc.summary.total_applicable}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${complianceRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                {complianceRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {uc.summary.compliant > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {uc.summary.compliant} compliant
                                </span>
                              )}
                              {uc.summary.in_progress > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {uc.summary.in_progress} in progress
                                </span>
                              )}
                              {uc.summary.non_compliant > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  {uc.summary.non_compliant} non-compliant
                                </span>
                              )}
                              {uc.summary.not_started > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {uc.summary.not_started} not started
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {uc.summary.critical_risk_issues > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  {uc.summary.critical_risk_issues} critical
                                </div>
                              )}
                              {uc.summary.high_risk_issues > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  {uc.summary.high_risk_issues} high
                                </div>
                              )}
                              {uc.summary.critical_risk_issues === 0 && uc.summary.high_risk_issues === 0 && (
                                <span className="text-gray-500 text-sm">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Nested Obligations */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-50 p-0">
                              <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                  {uc.obligations.length} Obligation{uc.obligations.length !== 1 ? 's' : ''}
                                </h3>
                                <div className="space-y-2">
                                  {uc.obligations.map((obl) => (
                                    <div
                                      key={obl.id}
                                      onClick={() => router.push(`/compliance-center/obligations/${obl.id}`)}
                                      className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        {/* Left: PN Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-sm font-semibold text-gray-900">
                                              {obl.pn_id}
                                            </span>
                                            {obl.pn_article && (
                                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                Article {obl.pn_article}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm font-medium text-gray-900 mb-3">
                                            {obl.pn_title || 'No title available'}
                                          </p>

                                          {/* Status Badges Row */}
                                          <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge
                                              type="applicability"
                                              status={obl.applicability_state}
                                            />
                                            {obl.implementation_state && (
                                              <StatusBadge
                                                type="implementation"
                                                status={obl.implementation_state}
                                              />
                                            )}
                                            {obl.risk_level && (
                                              <RiskBadge level={obl.risk_level} showIcon />
                                            )}
                                            {obl.due_date && (
                                              <DueDateBadge dueDate={obl.due_date} />
                                            )}
                                          </div>
                                        </div>

                                        {/* Right: Action Button */}
                                        <div className="flex-shrink-0">
                                          <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                                            <span className="text-sm font-medium">View Details</span>
                                            <ChevronRight className="w-4 h-4" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
