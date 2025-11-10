'use client';

import { useState, useCallback } from 'react';
import { generateSummary as generateSummaryAPI } from '../services/api';
import type { Summary, SummaryRequest } from '@/types';

interface UseSummaryReturn {
  summary: Summary | null;
  isGenerating: boolean;
  error: string | null;
  generateSummary: (fileId: string, type: 'simple' | 'detailed') => Promise<void>;
  clearSummary: () => void;
}

export function useSummary(): UseSummaryReturn {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (fileId: string, type: 'simple' | 'detailed') => {
    setIsGenerating(true);
    setError(null);

    try {
      // Call actual API
      const response = await generateSummaryAPI(fileId);

      if (response && response.summary_id) {
        const summaryData: Summary = {
          id: response.summary_id,
          fileId,
          type,
          content: response.content || '',
          keywords: [],
          sections: [],
          createdAt: new Date(),
        };

        setSummary(summaryData);
      } else {
        throw new Error('Summary generation failed');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('요약 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return {
    summary,
    isGenerating,
    error,
    generateSummary,
    clearSummary,
  };
}
