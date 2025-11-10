'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAnalyticsOverview,
  getLearningProgress,
  getWeakTopics,
  getWrongAnswerAnalysis,
  getStudyTimeAnalysis,
} from '../services/api';
import type {
  AnalyticsOverview,
  LearningProgress,
  WeakTopicsResponse,
  WrongAnswerAnalysis,
  StudyTimeAnalysis,
} from '@/types';

interface UseAnalyticsReturn {
  overview: AnalyticsOverview | null;
  progress: LearningProgress | null;
  weakTopics: WeakTopicsResponse | null;
  wrongAnswers: WrongAnswerAnalysis | null;
  studyTime: StudyTimeAnalysis | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseAnalyticsOptions {
  overviewDays?: number;
  progressLimit?: number;
  weakTopicsMinAttempts?: number;
  wrongAnswersLimit?: number;
  studyTimeDays?: number;
  autoFetch?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    overviewDays = 30,
    progressLimit = 10,
    weakTopicsMinAttempts = 2,
    wrongAnswersLimit = 20,
    studyTimeDays = 7,
    autoFetch = true,
  } = options;

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopicsResponse | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerAnalysis | null>(null);
  const [studyTime, setStudyTime] = useState<StudyTimeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [overviewData, progressData, weakTopicsData, wrongAnswersData, studyTimeData] =
        await Promise.all([
          getAnalyticsOverview(overviewDays),
          getLearningProgress(progressLimit),
          getWeakTopics(weakTopicsMinAttempts),
          getWrongAnswerAnalysis(wrongAnswersLimit),
          getStudyTimeAnalysis(studyTimeDays),
        ]);

      setOverview(overviewData);
      setProgress(progressData);
      setWeakTopics(weakTopicsData);
      setWrongAnswers(wrongAnswersData);
      setStudyTime(studyTimeData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setIsLoading(false);
    }
  }, [overviewDays, progressLimit, weakTopicsMinAttempts, wrongAnswersLimit, studyTimeDays]);

  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
    }
  }, [autoFetch, fetchAnalytics]);

  return {
    overview,
    progress,
    weakTopics,
    wrongAnswers,
    studyTime,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
