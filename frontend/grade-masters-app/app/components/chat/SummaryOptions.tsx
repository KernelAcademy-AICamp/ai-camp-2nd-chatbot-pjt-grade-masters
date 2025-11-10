'use client';

import { useState } from 'react';
import { cn } from '@/app/utils/helpers';

interface SummaryOptionsProps {
  onGenerate: (type: 'simple' | 'detailed') => void;
  isGenerating?: boolean;
}

export default function SummaryOptions({ onGenerate, isGenerating = false }: SummaryOptionsProps) {
  const [selectedType, setSelectedType] = useState<'simple' | 'detailed'>('simple');

  const handleGenerate = () => {
    onGenerate(selectedType);
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">요약 생성</h3>

      {/* Summary Type Selection */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium">요약 유형 선택</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedType('simple')}
            disabled={isGenerating}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all',
              selectedType === 'simple'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="font-medium mb-1">간단 요약</div>
            <div className="text-xs text-muted-foreground">
              핵심 내용만 빠르게 정리
            </div>
          </button>

          <button
            onClick={() => setSelectedType('detailed')}
            disabled={isGenerating}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all',
              selectedType === 'detailed'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="font-medium mb-1">상세 요약</div>
            <div className="text-xs text-muted-foreground">
              섹션별 자세한 내용 포함
            </div>
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={cn(
          'w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium',
          'hover:bg-primary/90 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            <span>요약 생성 중...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <span>요약 생성하기</span>
          </>
        )}
      </button>

      {isGenerating && (
        <p className="mt-3 text-sm text-muted-foreground text-center">
          예상 소요 시간: 약 30초
        </p>
      )}
    </div>
  );
}
