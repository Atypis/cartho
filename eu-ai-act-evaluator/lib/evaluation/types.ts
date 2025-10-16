/**
 * Type definitions for the EU AI Act evaluation system
 */

export type NodeKind = 'composite' | 'primitive';
export type Operator = 'allOf' | 'anyOf' | 'not' | 'xor';
export type AnswerType = 'boolean';
export type NodeStatus = 'pending' | 'evaluating' | 'completed' | 'error';

export interface Question {
  prompt: string;
  answer_type: AnswerType;
  help?: string;
}

export interface ContextItem {
  label: string;
  kind: 'definition' | 'guidance' | 'exception' | 'note';
  text: string;
  sources?: Array<{
    article: number;
    paragraph?: number;
    point?: string;
    quote?: string;
  }>;
}

export interface Context {
  items: ContextItem[];
}

export interface RequirementNode {
  id: string;
  label: string;
  kind: NodeKind;
  operator?: Operator;
  children?: string[];
  ref?: string;
  question?: Question;
  context?: Context;
  sources?: Array<{
    article: number;
    paragraph?: number;
    point?: string;
    quote?: string;
  }>;
}

export interface PrescriptiveNorm {
  id: string;
  title: string;
  type: string;
  article_refs: Array<{
    article: number;
    paragraph?: number;
    point?: string;
    quote?: string;
  }>;
  legal_consequence: {
    verbatim: string;
    notes?: string;
    context?: Context;
  };
  side_info?: {
    effective_from?: string;
  };
  requirements: {
    root: string;
    nodes: RequirementNode[];
  };
  shared_refs?: string[];
  metadata: {
    version: string;
    status: string;
    extraction_date: string;
  };
}

export interface SharedPrimitive {
  id: string;
  title: string;
  namespace: string;
  article_refs: Array<{
    article: number;
    paragraph?: number;
  }>;
  logic: {
    root: string;
    nodes: RequirementNode[];
  };
  metadata: {
    version: string;
    status: string;
    extraction_date: string;
  };
}

export interface EvaluationResult {
  nodeId: string;
  decision: boolean;
  confidence: number;
  reasoning: string;
}

export interface EvaluationState {
  nodeId: string;
  status: NodeStatus;
  result?: EvaluationResult;
  error?: string;
}
