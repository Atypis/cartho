'use client';

/**
 * ControlsTab Component
 *
 * Displays compliance controls for an obligation with status tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'verified';

interface Control {
  id: string;
  key: string;
  title: string;
  description: string;
  category: 'program' | 'documentation' | 'assessment';
  required: boolean;
  guidance: string;
  implementation_steps: string[];
  evidence_types: string[];
  effort_estimate: string;
}

interface ControlWithStatus extends Control {
  status: ControlStatus;
  notes?: string;
  last_reviewed_at?: string;
}

interface ControlsTabProps {
  obligationId: string;
  pnId: string;
  isApplicable: boolean;
}

// Mock data loader - in real implementation, this would fetch from API
function loadControlsForPN(pnId: string): Control[] {
  // This would actually load from /data/controls/${pnId}-controls.json
  // For now, we'll use the PN-04 controls structure
  if (pnId === 'PN-04') {
    // In production, this would be an API call
    return [
      {
        id: 'PN-04-C1',
        key: 'training-program',
        title: 'Establish AI Literacy Training Program',
        description: 'Develop and maintain a comprehensive AI literacy training program tailored to staff roles and responsibilities',
        category: 'program',
        required: true,
        guidance: "Create a structured training program covering: (1) Basic AI concepts and terminology, (2) AI capabilities and limitations, (3) Ethical considerations, (4) Legal obligations under the EU AI Act, (5) Organization's specific AI systems and their use cases.",
        implementation_steps: [
          'Conduct training needs assessment across different roles',
          'Develop role-specific curricula and materials',
          'Identify qualified trainers (internal or external)',
          'Establish training schedule and format (online/in-person)',
          'Create training documentation and resources',
        ],
        evidence_types: [
          'Training curriculum documents',
          'Training schedules',
          'Trainer qualifications',
          'Training materials (slides, videos, handbooks)',
        ],
        effort_estimate: 'High - Initial setup requires 2-4 weeks',
      },
      {
        id: 'PN-04-C2',
        key: 'training-completion',
        title: 'Track Training Completion and Attendance',
        description: 'Maintain records of all staff training participation and completion',
        category: 'documentation',
        required: true,
        guidance: 'Implement a system to track: (1) Who has completed training, (2) When training was completed, (3) Training modules/topics covered, (4) Assessment results if applicable.',
        implementation_steps: [
          'Select or configure training tracking system (LMS)',
          'Define completion criteria for each training module',
          'Implement automated attendance/completion tracking',
          'Create reporting dashboards for compliance monitoring',
          'Establish data retention policies for training records',
        ],
        evidence_types: [
          'Training completion certificates',
          'Attendance records',
          'LMS reports',
          'Individual training histories',
        ],
        effort_estimate: 'Medium - 1-2 weeks for system setup',
      },
      {
        id: 'PN-04-C3',
        key: 'competency-assessment',
        title: 'Conduct Competency Assessments',
        description: 'Evaluate staff understanding and retention of AI literacy concepts through assessments',
        category: 'assessment',
        required: false,
        guidance: 'Develop and administer assessments to verify staff comprehension. Can include knowledge tests, practical scenarios, role-playing, and case studies.',
        implementation_steps: [
          'Design assessment questions and scoring criteria',
          'Set minimum competency thresholds',
          'Implement assessment delivery mechanism',
          'Create remediation plans for failed assessments',
          'Document assessment results',
        ],
        evidence_types: [
          'Assessment questions/tests',
          'Individual assessment scores',
          'Pass/fail statistics',
          'Remediation records',
        ],
        effort_estimate: 'Medium - 1 week for initial development',
      },
      {
        id: 'PN-04-C4',
        key: 'role-based-requirements',
        title: 'Define Role-Based Training Requirements',
        description: 'Establish specific AI literacy requirements tailored to each job role and responsibility level',
        category: 'program',
        required: true,
        guidance: 'Create a training matrix mapping roles to required competencies. Consider technical staff, operational staff, management, end-users, and support staff.',
        implementation_steps: [
          'Catalog all roles that interact with AI systems',
          'Map competency requirements to each role',
          'Define minimum training hours per role',
          'Create role-specific training pathways',
          'Document role-training matrix',
        ],
        evidence_types: [
          'Role-training matrix document',
          'Job descriptions with AI literacy requirements',
          'Competency frameworks',
          'Training pathway documentation',
        ],
        effort_estimate: 'Medium - 1-2 weeks for analysis and documentation',
      },
      {
        id: 'PN-04-C5',
        key: 'refresher-training',
        title: 'Implement Ongoing Refresher Training',
        description: 'Establish periodic refresher training to maintain AI literacy levels and update staff on new developments',
        category: 'program',
        required: true,
        guidance: 'Implement annual or bi-annual refresher courses, updates when AI Act guidance changes, and training for new AI system deployments.',
        implementation_steps: [
          'Define refresher training frequency by role',
          'Create update/delta training materials',
          'Establish triggers for ad-hoc training',
          'Implement automated reminders',
          'Track refresher completion',
        ],
        evidence_types: [
          'Refresher training schedules',
          'Version history of training materials',
          'Refresher completion records',
          'Notifications sent to staff',
        ],
        effort_estimate: 'Low - Ongoing activity, 1-2 days per year',
      },
      {
        id: 'PN-04-C8',
        key: 'documentation-policy',
        title: 'Maintain AI Literacy Policy and Documentation',
        description: "Document the organization's AI literacy policy, requirements, and procedures",
        category: 'documentation',
        required: true,
        guidance: 'Create formal documentation including policy statement, training requirements by role, onboarding procedures, and governance structure.',
        implementation_steps: [
          'Draft AI Literacy Policy document',
          'Define governance structure',
          'Integrate into employee handbook',
          'Obtain management approval',
          'Communicate policy to all staff',
          'Establish review and update schedule',
        ],
        evidence_types: [
          'AI Literacy Policy document (signed)',
          'Employee handbook with AI literacy section',
          'Policy acknowledgment forms',
          'Version history of policy documents',
        ],
        effort_estimate: 'Low - 2-3 days for initial drafting',
      },
    ];
  }
  return [];
}

export function ControlsTab({ obligationId, pnId, isApplicable }: ControlsTabProps) {
  const controls = loadControlsForPN(pnId);

  // Mock status - in production, this would come from API
  const [controlStatuses, setControlStatuses] = useState<Record<string, ControlStatus>>({
    'PN-04-C1': 'in_progress',
    'PN-04-C2': 'not_started',
    'PN-04-C3': 'not_started',
    'PN-04-C4': 'implemented',
    'PN-04-C5': 'not_started',
    'PN-04-C8': 'verified',
  });

  const [expandedControls, setExpandedControls] = useState<Set<string>>(new Set());

  const controlsWithStatus: ControlWithStatus[] = controls.map((control) => ({
    ...control,
    status: controlStatuses[control.id] || 'not_started',
  }));

  // Calculate completion stats
  const requiredControls = controlsWithStatus.filter((c) => c.required);
  const completedRequired = requiredControls.filter(
    (c) => c.status === 'implemented' || c.status === 'verified'
  ).length;
  const completionPercentage = requiredControls.length > 0
    ? Math.round((completedRequired / requiredControls.length) * 100)
    : 0;

  const toggleExpanded = (controlId: string) => {
    setExpandedControls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(controlId)) {
        newSet.delete(controlId);
      } else {
        newSet.add(controlId);
      }
      return newSet;
    });
  };

  const handleStatusChange = (controlId: string, newStatus: ControlStatus) => {
    setControlStatuses((prev) => ({
      ...prev,
      [controlId]: newStatus,
    }));
  };

  if (!isApplicable) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            This obligation does not apply to this use case.
            <br />
            No compliance controls are required.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (controls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center mb-4">
            No compliance controls defined for {pnId} yet.
            <br />
            Controls are being developed for this obligation.
          </p>
          <p className="text-sm text-gray-500">
            Check back later or contact your compliance team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Controls Implementation Progress</CardTitle>
          <CardDescription>
            {completedRequired} of {requiredControls.length} required controls completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {controlsWithStatus.filter((c) => c.status === 'not_started').length}
                </div>
                <div className="text-xs text-gray-600">Not Started</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {controlsWithStatus.filter((c) => c.status === 'in_progress').length}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {controlsWithStatus.filter((c) => c.status === 'implemented').length}
                </div>
                <div className="text-xs text-gray-600">Implemented</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {controlsWithStatus.filter((c) => c.status === 'verified').length}
                </div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls List */}
      <div className="space-y-3">
        {controlsWithStatus.map((control) => {
          const isExpanded = expandedControls.has(control.id);

          return (
            <Card key={control.id} className={cn('transition-shadow', isExpanded && 'shadow-md')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleExpanded(control.id)}
                      className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-base">{control.title}</CardTitle>
                        {control.required && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {control.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{control.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <ControlStatusBadge status={control.status} />
                    <Select
                      value={control.status}
                      onValueChange={(value) => handleStatusChange(control.id, value as ControlStatus)}
                    >
                      <SelectTrigger className="w-[150px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* Guidance */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Implementation Guidance</h4>
                        <p className="text-sm text-blue-800">{control.guidance}</p>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Steps */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ListChecks className="w-4 h-4 text-gray-600" />
                      <h4 className="font-semibold text-sm text-gray-900">Implementation Steps</h4>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                      {control.implementation_steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence Types */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <h4 className="font-semibold text-sm text-gray-900">Required Evidence</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {control.evidence_types.map((evidence, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {evidence}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Effort Estimate */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{control.effort_estimate}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Add Evidence
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Create Task
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ControlStatusBadge({ status }: { status: ControlStatus }) {
  const config = {
    not_started: {
      icon: Circle,
      label: 'Not Started',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    in_progress: {
      icon: Clock,
      label: 'In Progress',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
    implemented: {
      icon: CheckCircle2,
      label: 'Implemented',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    verified: {
      icon: CheckCircle2,
      label: 'Verified',
      className: 'bg-green-100 text-green-700 border-green-300',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <Badge variant="outline" className={cn('font-medium flex items-center space-x-1', className)}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </Badge>
  );
}
