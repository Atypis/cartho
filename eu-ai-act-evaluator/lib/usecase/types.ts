/**
 * Type definitions for use case creation and analysis
 */

export interface UseCaseFormData {
  title: string;
  description: string;
}

export type CoverageStatus = 'complete' | 'needs_clarification' | 'missing';

export interface CoverageArea {
  id: string;
  label: string;
  status: CoverageStatus;
  extractedValue?: string;
}

export interface ClarificationQuestion {
  id: string;
  area: string; // Which coverage area this relates to
  question: string;
  context?: string; // Why we're asking
  status: CoverageStatus;
}

export interface ClarificationAnswers {
  [questionId: string]: string;
}

export interface UseCaseAnalysis {
  completeness: number; // 0-100
  extractedInfo: {
    systemPurpose?: string;
    technicalDetails?: string;
    useContext?: string;
    userRole?: string;
    geographicScope?: string;
  };
  coverageAreas: CoverageArea[];
  clarificationQuestions: ClarificationQuestion[];
  isComplete: boolean;
}
