'use client';

import { useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type {
  WrongAnswer,
  Question,
  QuestionDifficulty,
  ExamResult,
} from '@/types';

interface WrongAnswerFilter {
  difficulty?: QuestionDifficulty;
  topic?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  isResolved?: boolean;
}

type SortBy = 'date' | 'retryCount' | 'difficulty' | 'topic';
type SortOrder = 'asc' | 'desc';

interface UseWrongAnswersReturn {
  wrongAnswers: WrongAnswer[];
  filteredAnswers: WrongAnswer[];
  stats: {
    totalWrong: number;
    resolved: number;
    unresolved: number;
    byDifficulty: Record<QuestionDifficulty, number>;
    byTopic: Record<string, number>;
  };
  filter: WrongAnswerFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setFilter: (filter: WrongAnswerFilter) => void;
  setSorting: (sortBy: SortBy, sortOrder: SortOrder) => void;
  addWrongAnswers: (result: ExamResult, questions: Question[]) => void;
  markAsResolved: (id: string) => void;
  retryQuestion: (id: string) => void;
  deleteWrongAnswer: (id: string) => void;
  clearAll: () => void;
}

export function useWrongAnswers(): UseWrongAnswersReturn {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [filter, setFilter] = useState<WrongAnswerFilter>({});
  const [sortBy, setSortByState] = useState<SortBy>('date');
  const [sortOrder, setSortOrderState] = useState<SortOrder>('desc');

  // Load wrong answers from localStorage on mount
  useEffect(() => {
    const saved = storage.get<WrongAnswer[]>(STORAGE_KEYS.wrongAnswers);
    if (saved) {
      setWrongAnswers(saved);
    }
  }, []);

  // Save to localStorage whenever wrongAnswers change
  useEffect(() => {
    if (wrongAnswers.length > 0) {
      storage.set(STORAGE_KEYS.wrongAnswers, wrongAnswers);
    }
  }, [wrongAnswers]);

  // Add wrong answers from exam result
  const addWrongAnswers = useCallback(
    (result: ExamResult, questions: Question[]) => {
      const newWrongAnswers: WrongAnswer[] = result.results
        .filter((r) => !r.isCorrect)
        .map((gradingResult) => {
          const question = questions.find((q) => q.id === gradingResult.questionId);
          if (!question) return null;

          // Check if this question already exists in wrong answers
          const existing = wrongAnswers.find(
            (wa) => wa.questionId === gradingResult.questionId
          );

          if (existing) {
            // Update retry count
            return {
              ...existing,
              retryCount: existing.retryCount + 1,
              lastRetryAt: new Date(),
            };
          }

          // Create new wrong answer entry
          return {
            id: crypto.randomUUID(),
            questionId: gradingResult.questionId,
            question,
            userAnswer: '', // Will be populated from submission
            correctAnswer: gradingResult.modelAnswer || '',
            feedback: gradingResult.feedback,
            retryCount: 1,
            isResolved: false,
          };
        })
        .filter((wa): wa is WrongAnswer => wa !== null);

      setWrongAnswers((prev) => {
        // Merge new wrong answers with existing ones
        const merged = [...prev];
        newWrongAnswers.forEach((newWa) => {
          const existingIndex = merged.findIndex(
            (wa) => wa.questionId === newWa.questionId
          );
          if (existingIndex >= 0) {
            merged[existingIndex] = newWa;
          } else {
            merged.push(newWa);
          }
        });
        return merged;
      });
    },
    [wrongAnswers]
  );

  // Mark wrong answer as resolved
  const markAsResolved = useCallback((id: string) => {
    setWrongAnswers((prev) =>
      prev.map((wa) =>
        wa.id === id ? { ...wa, isResolved: true } : wa
      )
    );
  }, []);

  // Retry question (increment retry count)
  const retryQuestion = useCallback((id: string) => {
    setWrongAnswers((prev) =>
      prev.map((wa) =>
        wa.id === id
          ? {
              ...wa,
              retryCount: wa.retryCount + 1,
              lastRetryAt: new Date(),
            }
          : wa
      )
    );
  }, []);

  // Delete wrong answer
  const deleteWrongAnswer = useCallback((id: string) => {
    setWrongAnswers((prev) => prev.filter((wa) => wa.id !== id));
  }, []);

  // Clear all wrong answers
  const clearAll = useCallback(() => {
    setWrongAnswers([]);
    storage.remove(STORAGE_KEYS.wrongAnswers);
  }, []);

  // Set sorting
  const setSorting = useCallback((newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortByState(newSortBy);
    setSortOrderState(newSortOrder);
  }, []);

  // Apply filters and sorting
  const filteredAnswers = wrongAnswers
    .filter((wa) => {
      // Difficulty filter
      if (filter.difficulty && wa.question.difficulty !== filter.difficulty) {
        return false;
      }

      // Topic filter
      if (filter.topic && wa.question.topic !== filter.topic) {
        return false;
      }

      // Resolved filter
      if (filter.isResolved !== undefined && wa.isResolved !== filter.isResolved) {
        return false;
      }

      // Date range filter
      if (filter.dateRange && wa.lastRetryAt) {
        const date = new Date(wa.lastRetryAt);
        if (
          date < filter.dateRange.start ||
          date > filter.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison =
            (a.lastRetryAt?.getTime() || 0) - (b.lastRetryAt?.getTime() || 0);
          break;
        case 'retryCount':
          comparison = a.retryCount - b.retryCount;
          break;
        case 'difficulty': {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          comparison =
            difficultyOrder[a.question.difficulty] -
            difficultyOrder[b.question.difficulty];
          break;
        }
        case 'topic':
          comparison = (a.question.topic || '').localeCompare(
            b.question.topic || ''
          );
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate statistics
  const stats = {
    totalWrong: wrongAnswers.length,
    resolved: wrongAnswers.filter((wa) => wa.isResolved).length,
    unresolved: wrongAnswers.filter((wa) => !wa.isResolved).length,
    byDifficulty: wrongAnswers.reduce(
      (acc, wa) => {
        acc[wa.question.difficulty] = (acc[wa.question.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<QuestionDifficulty, number>
    ),
    byTopic: wrongAnswers.reduce(
      (acc, wa) => {
        const topic = wa.question.topic || '기타';
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return {
    wrongAnswers,
    filteredAnswers,
    stats,
    filter,
    sortBy,
    sortOrder,
    setFilter,
    setSorting,
    addWrongAnswers,
    markAsResolved,
    retryQuestion,
    deleteWrongAnswer,
    clearAll,
  };
}
