'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { ExamResult, LearningStats, StudySession } from '@/types';

interface UseLearningStatsReturn {
  stats: LearningStats;
  sessions: StudySession[];
  addSession: (session: StudySession) => void;
  addExamResult: (result: ExamResult) => void;
  getWeakAreas: () => { topic: string; accuracy: number }[];
  getStrongAreas: () => { topic: string; accuracy: number }[];
  getImprovementRate: () => number;
}

export function useLearningStats(): UseLearningStatsReturn {
  const [stats, setStats] = useState<LearningStats>({
    totalStudyTime: 0,
    totalPDFsProcessed: 0,
    totalQuestionsSolved: 0,
    averageScore: 0,
    improvementRate: 0,
    weakAreas: [],
    strongAreas: [],
  });

  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedStats = storage.get<LearningStats>(STORAGE_KEYS.learningStats);
    const savedSessions = storage.get<StudySession[]>('gm-study-sessions');

    if (savedStats) {
      setStats(savedStats);
    }
    if (savedSessions) {
      setSessions(savedSessions);
    }
  }, []);

  // Save to localStorage whenever stats or sessions change
  useEffect(() => {
    if (stats.totalQuestionsSolved > 0) {
      storage.set(STORAGE_KEYS.learningStats, stats);
    }
  }, [stats]);

  useEffect(() => {
    if (sessions.length > 0) {
      storage.set('gm-study-sessions', sessions);
    }
  }, [sessions]);

  const addSession = useCallback((session: StudySession) => {
    setSessions((prev) => [...prev, session]);

    setStats((prev) => ({
      ...prev,
      totalStudyTime: prev.totalStudyTime + (session.duration || 0),
      totalPDFsProcessed: prev.totalPDFsProcessed + 1,
    }));
  }, []);

  const addExamResult = useCallback((result: ExamResult) => {
    setStats((prev) => {
      const newTotalQuestions = prev.totalQuestionsSolved + result.results.length;
      const newAverageScore =
        (prev.averageScore * prev.totalQuestionsSolved + result.percentage) /
        newTotalQuestions;

      // Calculate weak and strong areas
      const topicScores: Record<string, { correct: number; total: number }> = {};

      result.results.forEach((r) => {
        // In a real app, you'd get the topic from the question
        const topic = '일반'; // placeholder
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].total += 1;
        if (r.isCorrect) {
          topicScores[topic].correct += 1;
        }
      });

      const areas = Object.entries(topicScores).map(([topic, scores]) => ({
        topic,
        accuracy: (scores.correct / scores.total) * 100,
      }));

      const sortedAreas = [...areas].sort((a, b) => a.accuracy - b.accuracy);
      const weakAreas = sortedAreas.slice(0, 3);
      const strongAreas = sortedAreas.slice(-3).reverse();

      return {
        ...prev,
        totalQuestionsSolved: newTotalQuestions,
        averageScore: newAverageScore,
        weakAreas,
        strongAreas,
      };
    });
  }, []);

  const getWeakAreas = useCallback(() => {
    return stats.weakAreas;
  }, [stats.weakAreas]);

  const getStrongAreas = useCallback(() => {
    return stats.strongAreas;
  }, [stats.strongAreas]);

  const getImprovementRate = useCallback(() => {
    if (sessions.length < 2) return 0;

    // Compare recent sessions with older sessions
    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(0, Math.min(5, sessions.length - 5));

    const recentAvg =
      recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
      recentSessions.length;
    const olderAvg =
      olderSessions.length > 0
        ? olderSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          olderSessions.length
        : recentAvg;

    const improvement = recentAvg - olderAvg;
    return Math.round(improvement * 10) / 10;
  }, [sessions]);

  return {
    stats,
    sessions,
    addSession,
    addExamResult,
    getWeakAreas,
    getStrongAreas,
    getImprovementRate,
  };
}
