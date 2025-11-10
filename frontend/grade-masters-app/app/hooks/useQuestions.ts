'use client';

import { useState, useCallback } from 'react';
import { generateQuestions } from '../services/api';
import type {
  QuestionSet,
  Question,
  QuestionDifficulty,
  QuestionType,
  QuestionGenerationRequest,
} from '@/types';

interface UseQuestionsReturn {
  questionSet: QuestionSet | null;
  isGenerating: boolean;
  error: string | null;
  generateQuestionSet: (
    fileId: string,
    options: {
      difficulty: QuestionDifficulty;
      type: QuestionType;
      count: number;
      topics?: string[];
    }
  ) => Promise<void>;
  editQuestion: (questionId: string, content: string) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  clearQuestionSet: () => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestionSet = useCallback(
    async (
      fileId: string,
      options: {
        difficulty: QuestionDifficulty;
        type: QuestionType;
        count: number;
        topics?: string[];
      }
    ) => {
      setIsGenerating(true);
      setError(null);

      try {
        const request: QuestionGenerationRequest = {
          fileId,
          count: options.count,
          difficulty: options.difficulty,
          type: options.type,
          topics: options.topics,
        };

        // TODO: Replace with actual API call
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate mock questions
        const mockQuestions: Question[] = Array.from(
          { length: options.count },
          (_, i) => ({
            id: crypto.randomUUID(),
            content:
              options.type === 'short_answer'
                ? `[${options.difficulty}] 단답형 문제 ${i + 1}: 이 주제에 대해 간단히 설명하세요.`
                : `[${options.difficulty}] 서술형 문제 ${i + 1}: 이 개념에 대해 자세히 설명하고, 실제 사례를 들어 논하세요.`,
            type: options.type,
            difficulty: options.difficulty,
            points: options.type === 'short_answer' ? 5 : 10,
            topic: options.topics?.[0],
          })
        );

        const mockQuestionSet: QuestionSet = {
          id: crypto.randomUUID(),
          name: `${new Date().toLocaleDateString()} 생성 문제`,
          fileId,
          questions: mockQuestions,
          createdAt: new Date(),
          totalPoints: mockQuestions.reduce((sum, q) => sum + q.points, 0),
        };

        setQuestionSet(mockQuestionSet);
      } catch (err) {
        console.error('Failed to generate questions:', err);
        setError('문제 생성에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const editQuestion = useCallback((questionId: string, content: string) => {
    setQuestionSet((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, content } : q
        ),
      };
    });
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestionSet((prev) => {
      if (!prev) return prev;

      const updatedQuestions = prev.questions.filter((q) => q.id !== questionId);
      return {
        ...prev,
        questions: updatedQuestions,
        totalPoints: updatedQuestions.reduce((sum, q) => sum + q.points, 0),
      };
    });
  }, []);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setQuestionSet((prev) => {
      if (!prev) return prev;

      const newQuestions = [...prev.questions];
      const [removed] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, removed);

      return {
        ...prev,
        questions: newQuestions,
      };
    });
  }, []);

  const clearQuestionSet = useCallback(() => {
    setQuestionSet(null);
    setError(null);
  }, []);

  return {
    questionSet,
    isGenerating,
    error,
    generateQuestionSet,
    editQuestion,
    deleteQuestion,
    reorderQuestions,
    clearQuestionSet,
  };
}
