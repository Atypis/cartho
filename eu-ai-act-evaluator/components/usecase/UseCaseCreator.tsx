'use client';

import { useState } from 'react';
import { InitialForm } from './InitialForm';
import { AnalysisLoader } from './AnalysisLoader';
import { ClarificationView } from './ClarificationView';
import { CompletionSummary } from './CompletionSummary';
import { supabase } from '@/lib/supabase/client';
import type { UseCaseFormData, UseCaseAnalysis, ClarificationAnswers } from '@/lib/usecase/types';

type CreationStage = 'initial' | 'analyzing' | 'clarifying' | 'complete';

interface UseCaseCreatorProps {
  onComplete: (useCaseId: string) => void;
  onCancel: () => void;
}

export function UseCaseCreator({ onComplete, onCancel }: UseCaseCreatorProps) {
  const [stage, setStage] = useState<CreationStage>('initial');
  const [formData, setFormData] = useState<UseCaseFormData | null>(null);
  const [analysis, setAnalysis] = useState<UseCaseAnalysis | null>(null);
  const [iterationCount, setIterationCount] = useState(0);

  const analyzeUseCase = async (data: UseCaseFormData): Promise<UseCaseAnalysis> => {
    const response = await fetch('/api/usecase/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze use case');
    }

    return response.json();
  };

  const saveUseCase = async (data: UseCaseFormData, analysisData: UseCaseAnalysis): Promise<string> => {
    // Ensure we attach a session for RLS policies that require it
    let sessionId: string | null = null;
    try {
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      sessionId = sessions && sessions.length > 0 ? sessions[0].id : null;

      if (!sessionId) {
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({ title: 'New Chat' })
          .select()
          .single();
        if (!sessionError && newSession) {
          sessionId = newSession.id;
        }
      }
    } catch (e) {
      console.warn('Could not ensure chat session for use-case creation:', e);
    }

    const { data: useCase, error } = await supabase
      .from('use_cases')
      .insert({
        title: data.title,
        description: data.description,
        created_in_session_id: sessionId,
        tags: [], // Default empty tags array
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving use case:', error);
      // Surface more informative message if available
      const msg = (error as any)?.message || 'Failed to save use case';
      throw new Error(msg);
    }

    return useCase.id;
  };

  const mergeAnswersIntoDescription = (
    originalDescription: string,
    answers: ClarificationAnswers,
    questions: UseCaseAnalysis['clarificationQuestions']
  ): string => {
    const clarifications = Object.entries(answers)
      .filter(([_, answer]) => answer.trim() !== '')
      .map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        const area = question?.area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Additional Info';
        return `\n\n${area}:\n${answer}`;
      })
      .join('');

    return originalDescription + clarifications;
  };

  const handleInitialSubmit = async (data: UseCaseFormData) => {
    setFormData(data);
    setStage('analyzing');

    try {
      const analysisResult = await analyzeUseCase(data);
      setAnalysis(analysisResult);

      if (analysisResult.isComplete) {
        setStage('complete');
      } else {
        setStage('clarifying');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze use case. Please try again.');
      setStage('initial');
    }
  };

  const handleClarificationSubmit = async (answers: ClarificationAnswers) => {
    if (!formData || !analysis) return;

    setIterationCount(prev => prev + 1);

    // Merge answers into description
    const updatedDescription = mergeAnswersIntoDescription(
      formData.description,
      answers,
      analysis.clarificationQuestions
    );

    const updatedFormData = {
      ...formData,
      description: updatedDescription,
    };

    setFormData(updatedFormData);
    setStage('analyzing');

    try {
      const newAnalysis = await analyzeUseCase(updatedFormData);
      setAnalysis(newAnalysis);

      // Prevent infinite loops - max 2 clarification rounds
      if (newAnalysis.isComplete || iterationCount >= 2) {
        setStage('complete');
      } else {
        setStage('clarifying');
      }
    } catch (error) {
      console.error('Re-analysis error:', error);
      alert('Failed to re-analyze. Please try again.');
      setStage('clarifying');
    }
  };

  const handleProceedToEvaluation = async () => {
    if (!formData || !analysis) return;

    try {
      const useCaseId = await saveUseCase(formData, analysis);
      onComplete(useCaseId);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save use case. Please try again.');
    }
  };

  const handleSkip = async () => {
    // User chooses to skip clarifications and proceed anyway
    setStage('complete');
  };

  return (
    <div className="h-full bg-neutral-50 overflow-y-auto flex items-center justify-center p-8">
      <div className="w-full max-w-3xl my-auto">
        {stage === 'initial' && (
          <InitialForm onSubmit={handleInitialSubmit} onCancel={onCancel} />
        )}

        {stage === 'analyzing' && <AnalysisLoader />}

        {stage === 'clarifying' && analysis && (
          <ClarificationView
            analysis={analysis}
            onSubmit={handleClarificationSubmit}
            onSkip={handleSkip}
          />
        )}

        {stage === 'complete' && analysis && formData && (
          <CompletionSummary
            formData={formData}
            analysis={analysis}
            onProceed={handleProceedToEvaluation}
          />
        )}
      </div>
    </div>
  );
}
