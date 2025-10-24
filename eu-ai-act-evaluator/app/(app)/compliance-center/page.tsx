'use client';

/**
 * Compliance Center Overview Dashboard
 *
 * Executive view of compliance posture with KPIs and stats
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Clock, FileText, TrendingUp, ChevronRight } from 'lucide-react';

interface ComplianceStats {
  total: number;
  applicability: {
    pending: number;
    evaluating: number;
    applies: number;
    not_applicable: number;
  };
  compliance: {
    not_started: number;
    in_progress: number;
    compliant: number;
    partial: number;
    non_compliant: number;
    waived: number;
  };
  risk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    unassigned: number;
  };
  deadlines: {
    upcoming: number;
    overdue: number;
  };
  needsAttention: {
    highRiskNonCompliant: number;
    overdue: number;
    total: number;
  };
}

export default function ComplianceCenterPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/obligations/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading compliance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              No obligation instances found. Run evaluations to populate the compliance center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicableCount = stats.applicability.applies;
  const complianceRate = applicableCount > 0
    ? Math.round((stats.compliance.compliant / applicableCount) * 100)
    : 0;

  return (
    <SidebarInset>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage AI Act obligations across all use cases
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/compliance-center/obligations')}>
              View All Obligations
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Obligations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Obligations</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                {applicableCount} applicable, {stats.applicability.not_applicable} N/A
              </p>
            </CardContent>
          </Card>

          {/* Compliance Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceRate}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.compliance.compliant} of {applicableCount} compliant
              </p>
            </CardContent>
          </Card>

          {/* High-Risk Non-Compliant */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.needsAttention.highRiskNonCompliant}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.deadlines.upcoming}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Next 30 days ({stats.deadlines.overdue} overdue)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applicability Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Applicability Status</CardTitle>
              <CardDescription>Evaluation results across all obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applies</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-green-600 rounded"
                        style={{ width: `${(stats.applicability.applies / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.applicability.applies}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Not Applicable</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-gray-400 rounded"
                        style={{ width: `${(stats.applicability.not_applicable / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.applicability.not_applicable}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-blue-400 rounded"
                        style={{ width: `${(stats.applicability.pending / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.applicability.pending}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
              <CardDescription>Compliance for applicable obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compliant</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-green-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.compliance.compliant / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.compliance.compliant}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-yellow-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.compliance.in_progress / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.compliance.in_progress}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Non-Compliant</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-red-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.compliance.non_compliant / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.compliance.non_compliant}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Not Started</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-gray-400 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.compliance.not_started / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.compliance.not_started}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>For applicable obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-red-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.risk.critical / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.risk.critical}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-orange-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.risk.high / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.risk.high}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medium</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-yellow-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.risk.medium / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.risk.medium}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                      <div
                        className="h-2 bg-blue-600 rounded"
                        style={{ width: applicableCount > 0 ? `${(stats.risk.low / applicableCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stats.risk.low}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Needs Attention */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Needs Attention
              </CardTitle>
              <CardDescription>Items requiring immediate action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-900">High-Risk Non-Compliant</span>
                  <span className="text-lg font-bold text-red-600">
                    {stats.needsAttention.highRiskNonCompliant}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Overdue Deadlines</span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats.deadlines.overdue}
                  </span>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => router.push('/compliance-center/obligations?filter=needs-attention')}
                >
                  View All Issues
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </SidebarInset>
  );
}
