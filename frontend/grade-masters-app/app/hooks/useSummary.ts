'use client';

import { useState, useCallback } from 'react';
import { getSummary } from '../services/api';
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
      const request: SummaryRequest = {
        fileId,
        type,
        options: {
          includeSections: type === 'detailed',
          includeKeywords: true,
        },
      };

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock summary data
      const mockSummary: Summary = {
        id: crypto.randomUUID(),
        fileId,
        type,
        content:
          type === 'simple'
            ? '이 문서는 React와 Next.js를 활용한 웹 개발에 대해 다룹니다. 주요 개념으로는 컴포넌트 기반 아키텍처, 서버 사이드 렌더링, 그리고 최적화 기법이 포함됩니다.'
            : '이 문서는 React와 Next.js를 활용한 현대적인 웹 개발 방법론에 대해 상세히 다룹니다. React의 컴포넌트 기반 아키텍처를 통해 재사용 가능한 UI를 구축하는 방법, Next.js의 서버 사이드 렌더링과 정적 사이트 생성 기능을 활용한 성능 최적화 전략, 그리고 실무에서 적용 가능한 다양한 최적화 기법들을 소개합니다.',
        keywords: ['React', 'Next.js', '서버 사이드 렌더링', '컴포넌트', '최적화'],
        sections:
          type === 'detailed'
            ? [
                {
                  id: '1',
                  title: '1. React 기초',
                  content:
                    'React는 Facebook에서 개발한 사용자 인터페이스 라이브러리입니다. 컴포넌트 기반 아키텍처를 통해 재사용 가능하고 유지보수가 쉬운 UI를 구축할 수 있습니다.',
                  pageRange: { start: 1, end: 5 },
                },
                {
                  id: '2',
                  title: '2. Next.js 소개',
                  content:
                    'Next.js는 React 기반의 프레임워크로, 서버 사이드 렌더링, 정적 사이트 생성, API 라우팅 등 다양한 기능을 제공합니다.',
                  pageRange: { start: 6, end: 12 },
                },
                {
                  id: '3',
                  title: '3. 성능 최적화',
                  content:
                    '이미지 최적화, 코드 스플리팅, 레이지 로딩 등의 기법을 통해 웹 애플리케이션의 성능을 향상시킬 수 있습니다.',
                  pageRange: { start: 13, end: 20 },
                },
              ]
            : [],
        createdAt: new Date(),
      };

      setSummary(mockSummary);
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
