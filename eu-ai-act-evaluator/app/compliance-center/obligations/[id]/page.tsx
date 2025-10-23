'use client';

/**
 * Obligation Detail Page
 *
 * Deep dive into a single obligation with tabs for different aspects
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/compliance/shared/StatusBadge';
import { RiskBadge } from '@/components/compliance/shared/RiskBadge';
import { DueDateBadge } from '@/components/compliance/shared/DueDateBadge';
import { RequirementsGrid } from '@/components/evaluation/RequirementsGrid';
import { ControlsTab } from '@/components/compliance/controls/ControlsTab';
import { ChevronLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { reconstructEvaluation } from '@/lib/evaluation/reconstruct';
import type { Database } from '@/lib/supabase/types';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationState } from '@/lib/evaluation/types';

type ObligationInstance = Database['public']['Tables']['obligation_instances']['Row'] & {
  use_cases: {
    id: string;
    title: string;
    description: string;
    tags: string[];
  };
};

type Evaluation = Database['public']['Tables']['evaluations']['Row'];

interface ObligationDetail {
  obligation: ObligationInstance;
  evaluations: Evaluation[];
  history: any[];
}

export default function ObligationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [detail, setDetail] = useState<ObligationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evaluation');

  // Evaluation data
  const [pnData, setPNData] = useState<PrescriptiveNorm | null>(null);
  const [sharedPrimitives, setSharedPrimitives] = useState<SharedPrimitive[]>([]);
  const [evaluationStates, setEvaluationStates] = useState<EvaluationState[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<any[]>([]);

  useEffect(() => {
    loadObligationDetail();
  }, [params.id]);

  const loadObligationDetail = async () => {
    try {
      // Load obligation details
      const res = await fetch(`/api/obligations/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);

        // Load PN data for evaluation tab
        if (data.obligation.latest_evaluation_id) {
          await loadEvaluationData(data.obligation.pn_id, data.obligation.latest_evaluation_id);
        }
      }
    } catch (error) {
      console.error('Error loading obligation detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluationData = async (pnId: string, evaluationId: string) => {
    try {
      // Load PN bundle (PN + shared primitives)
      const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${pnId}`);
      if (bundleRes.ok) {
        const bundleData = await bundleRes.json();
        const pn = bundleData.pns[0];
        const shared = bundleData.sharedPrimitives || [];

        setPNData(pn);
        setSharedPrimitives(shared);

        // Load evaluation results
        const { supabase } = await import('@/lib/supabase/client');
        const { data: results } = await supabase
          .from('evaluation_results')
          .select('*')
          .eq('evaluation_id', evaluationId);

        // Reconstruct evaluation
        const reconstructed = reconstructEvaluation(pn, shared, results || []);
        setEvaluationStates(reconstructed.states);
        setExpandedNodes(reconstructed.nodes);
      }
    } catch (error) {
      console.error('Error loading evaluation data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading obligation details...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Obligation Not Found</CardTitle>
            <CardDescription>
              The requested obligation could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/compliance-center/obligations')}>
              Back to Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { obligation } = detail;

  return (
    <SidebarInset>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/compliance-center/obligations')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {obligation.pn_id}
                  </h1>
                  {obligation.pn_article && (
                    <span className="text-lg text-gray-500">
                      Article {obligation.pn_article}
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700">
                  {obligation.pn_title || 'No title available'}
                </p>
              </div>
            </div>
          </div>

        {/* Use Case Context */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Use Case</p>
              <p className="text-lg font-semibold text-gray-900">
                {obligation.use_cases.title}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/?usecase=${obligation.use_case_id}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Cockpit
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge type="applicability" status={obligation.applicability_state} />
          {obligation.implementation_state && (
            <StatusBadge type="implementation" status={obligation.implementation_state} />
          )}
          <RiskBadge level={obligation.risk_level} showIcon />
          {obligation.due_date && <DueDateBadge dueDate={obligation.due_date} />}
          {obligation.evaluated_at && (
            <span className="text-sm text-gray-600">
              Last evaluated: {new Date(obligation.evaluated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-white border-b px-8">
            <TabsList>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="controls">
                Controls
                <span className="ml-2 text-xs text-green-600">✨ Demo</span>
              </TabsTrigger>
              <TabsTrigger value="evidence" disabled>
                Evidence
                <span className="ml-2 text-xs text-gray-500">(Phase 3)</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" disabled>
                Tasks
                <span className="ml-2 text-xs text-gray-500">(Phase 3)</span>
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-8">
            <TabsContent value="evaluation" className="mt-0">
              {pnData && expandedNodes.length > 0 ? (
                <div>
                  {/* PN Metadata */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Legal Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Article References
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pnData.article_refs?.map((ref, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                              >
                                Article {ref.article}
                              </span>
                            ))}
                          </div>
                        </div>
                        {pnData.legal_consequence?.verbatim && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Legal Consequence
                            </p>
                            <p className="text-sm text-gray-600">
                              {pnData.legal_consequence.verbatim}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements Grid */}
                  <RequirementsGrid
                    nodes={expandedNodes}
                    rootId={pnData.requirements.root}
                    evaluationStates={evaluationStates}
                    pnTitle={pnData.title}
                    pnArticle={pnData.article_refs?.[0]?.article?.toString()}
                    pnLegalText={pnData.legal_consequence?.verbatim}
                  />

                  {/* Re-evaluation Button */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      disabled
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-run Evaluation (Coming Soon)
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-600 mb-4">
                      No evaluation data available for this obligation
                    </p>
                    <p className="text-sm text-gray-500">
                      Run an evaluation from the Use Case Cockpit to populate this view.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="controls" className="mt-0">
              <ControlsTab
                obligationId={params.id}
                pnId={obligation.pn_id}
                isApplicable={obligation.applicability_state === 'applies'}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Status History</CardTitle>
                  <CardDescription>Audit trail of all state changes</CardDescription>
                </CardHeader>
                <CardContent>
                  {detail.history.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No history available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {detail.history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start space-x-4 pb-4 border-b last:border-0"
                        >
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {entry.kind === 'applicability' ? 'Applicability' : 'Implementation'} changed
                            </p>
                            <p className="text-sm text-gray-600">
                              {entry.from_state ? `${entry.from_state} → ` : ''}
                              {entry.to_state}
                            </p>
                            {entry.reason && (
                              <p className="text-sm text-gray-500 mt-1">{entry.reason}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(entry.changed_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      </div>
    </SidebarInset>
  );
}
