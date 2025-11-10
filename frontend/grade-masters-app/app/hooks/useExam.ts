'use client';

import { useState, useCallback } from 'react';
import { submitQuiz } from '../services/api';
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
        // Format answers for backend API (using index)
        const formattedAnswers = answers.map((answer, index) => ({
          index: index,
          answer: answer.content,
        }));

        console.log('Submitting answers:', formattedAnswers);

        // Call actual API
        const response = await submitQuiz(questionSetId, formattedAnswers);

        if (response && response.result_id && response.results) {
          // Map results back to question IDs using index
          const gradingResults: GradingResult[] = response.results.map((result: any) => {
            const matchingAnswer = answers[result.index];
            return {
              questionId: matchingAnswer?.questionId || `question-${result.index}`,
              score: result.score || 0,
              maxScore: 1.0, // Backend uses normalized scores (0.0-1.0)
              feedback: result.feedback || '',
              modelAnswer: result.correct_answer || '',
              isCorrect: result.is_correct || false,
            };
          });

          const totalScore = gradingResults.reduce((sum, r) => sum + r.score, 0);
          const maxScore = gradingResults.length; // Total questions
          const percentage = (response.accuracy || 0) * 100; // Backend returns 0.0-1.0

          let grade = 'F';
          if (percentage >= 90) grade = 'A';
          else if (percentage >= 80) grade = 'B';
          else if (percentage >= 70) grade = 'C';
          else if (percentage >= 60) grade = 'D';

          const examResult: ExamResult = {
            id: response.result_id,
            questionSetId,
            totalScore,
            maxScore,
            percentage,
            grade,
            results: gradingResults,
            submittedAt: new Date(),
            timeSpent,
          };

          console.log('Exam graded:', examResult);
          setResult(examResult);
        } else {
          throw new Error('Quiz submission failed');
        }
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
