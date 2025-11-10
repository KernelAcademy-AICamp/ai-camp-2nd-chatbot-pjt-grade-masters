'use client';

import { cn } from '@/app/utils/helpers';
import type { QuestionDifficulty } from '@/types';

interface WrongAnswersFilterProps {
  difficulty?: QuestionDifficulty;
  topics: string[];
  selectedTopic?: string;
  showResolved: boolean;
  sortBy: 'date' | 'retryCount' | 'difficulty' | 'topic';
  sortOrder: 'asc' | 'desc';
  onDifficultyChange: (difficulty?: QuestionDifficulty) => void;
  onTopicChange: (topic?: string) => void;
  onShowResolvedChange: (show: boolean) => void;
  onSortChange: (
    sortBy: 'date' | 'retryCount' | 'difficulty' | 'topic',
    sortOrder: 'asc' | 'desc'
  ) => void;
  onClearAll: () => void;
}

export default function WrongAnswersFilter({
  difficulty,
  topics,
  selectedTopic,
  showResolved,
  sortBy,
  sortOrder,
  onDifficultyChange,
  onTopicChange,
  onShowResolvedChange,
  onSortChange,
  onClearAll,
}: WrongAnswersFilterProps) {
  const difficulties: (QuestionDifficulty | undefined)[] = [
    undefined,
    'easy',
    'medium',
    'hard',
  ];

  const sortOptions = [
    { value: 'date', label: '날짜순' },
    { value: 'retryCount', label: '시도 횟수순' },
    { value: 'difficulty', label: '난이도순' },
    { value: 'topic', label: '주제순' },
  ] as const;

  const handleSortChange = (
    newSortBy: 'date' | 'retryCount' | 'difficulty' | 'topic'
  ) => {
    if (sortBy === newSortBy) {
      // Toggle sort order
      onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field, default to desc
      onSortChange(newSortBy, 'desc');
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      {/* Difficulty Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">난이도</label>
        <div className="flex gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff || 'all'}
              onClick={() => onDifficultyChange(diff)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                difficulty === diff
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              )}
            >
              {diff === undefined && '전체'}
              {diff === 'easy' && '하'}
              {diff === 'medium' && '중'}
              {diff === 'hard' && '상'}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Filter */}
      {topics.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">주제</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTopicChange(undefined)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                selectedTopic === undefined
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              )}
            >
              전체
            </button>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => onTopicChange(topic)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedTopic === topic
                    ? 'bg-primary text-primary-foreground'
                    : 'border hover:bg-muted'
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show Resolved Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">해결된 문제 보기</label>
        <button
          onClick={() => onShowResolvedChange(!showResolved)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            showResolved ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              showResolved ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Sort Options */}
      <div>
        <label className="text-sm font-medium mb-2 block">정렬</label>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between',
                sortBy === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              )}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={cn(
                    'h-4 w-4 transition-transform',
                    sortOrder === 'desc' && 'rotate-180'
                  )}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="w-full px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
      >
        모든 오답 삭제
      </button>
    </div>
  );
}
