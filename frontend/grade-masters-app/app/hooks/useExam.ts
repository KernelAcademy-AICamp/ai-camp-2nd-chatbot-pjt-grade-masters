'use client';

import { useState, useCallback } from 'react';
import { submitExam } from '../services/api';
import type {
  Answer,
  ExamResult,
  GradingResult,
  SubmissionRequest,
} from '@/types';

interface UseExamReturn {
  result: ExamResult | null;
  isGrading: boolean;
  error: string | null;
  submitAnswers: (
    questionSetId: string,
    answers: Answer[],
    timeSpent: number
  ) => Promise<void>;
  clearResult: () => void;
}

export function useExam(): UseExamReturn {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAnswers = useCallback(
    async (questionSetId: string, answers: Answer[], timeSpent: number) => {
      setIsGrading(true);
      setError(null);

      try {
        const request: SubmissionRequest = {
          questionSetId,
          answers,
          timeSpent,
        };

        // TODO: Replace with actual API call
        // Simulate grading delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate mock grading results
        const gradingResults: GradingResult[] = answers.map((answer) => {
          // Simple mock grading: 70-100% random score
          const randomScore = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
          const maxScore = 10;
          const score = Math.round(randomScore * maxScore);
          const isCorrect = score >= maxScore * 0.8;

          return {
            questionId: answer.questionId,
            score,
            maxScore,
            feedback: isCorrect
              ? '훌륭합니다! 핵심 개념을 잘 이해하고 있습니다.'
              : '개념은 이해하셨지만, 좀 더 구체적인 설명이 필요합니다. 예시를 들어 설명해보세요.',
            modelAnswer: !isCorrect
              ? '모범 답안: 이 개념은 다음과 같이 설명할 수 있습니다...'
              : undefined,
            isCorrect,
          };
        });

        const totalScore = gradingResults.reduce((sum, r) => sum + r.score, 0);
        const maxScore = gradingResults.reduce((sum, r) => sum + r.maxScore, 0);
        const percentage = (totalScore / maxScore) * 100;

        let grade = 'F';
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';

        const mockResult: ExamResult = {
          id: crypto.randomUUID(),
          questionSetId,
          totalScore,
          maxScore,
          percentage,
          grade,
          results: gradingResults,
          submittedAt: new Date(),
          timeSpent,
        };

        setResult(mockResult);
      } catch (err) {
        console.error('Failed to submit exam:', err);
        setError('채점에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsGrading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isGrading,
    error,
    submitAnswers,
    clearResult,
  };
}
