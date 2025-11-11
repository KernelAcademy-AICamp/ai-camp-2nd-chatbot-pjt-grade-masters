'use client';

import { useState } from 'react';
import { cn } from '@/app/utils/helpers';
import type { QuestionDifficulty, QuestionType } from '@/types';

interface QuestionOptionsProps {
  onGenerate: (options: {
    difficulty: QuestionDifficulty;
    type: QuestionType;
    count: number;
    topics?: string[];
  }) => void;
  isGenerating?: boolean;
  availableTopics?: string[];
}

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuestionOptions({
  onGenerate,
  isGenerating = false,
  availableTopics = [],
}: QuestionOptionsProps) {
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('short_answer');
  const [count, setCount] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  const handleGenerate = () => {
    onGenerate({
      difficulty,
      type: questionType,
      count,
      topics: selectedTopics.length > 0 ? selectedTopics : undefined,
    });
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const estimatedTime = Math.ceil(count * 10); // ~10 seconds per question for generation

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">문제 생성</h3>
        <p className="text-sm text-muted-foreground">
          학습 자료를 기반으로 연습 문제를 생성합니다
        </p>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">난이도 선택</label>
        <div className="grid grid-cols-3 gap-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              disabled={isGenerating}
              className={cn(
                'p-3 rounded-lg border-2 text-center transition-all',
                difficulty === level
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
                isGenerating && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="font-medium">
                {level === 'easy' && '하'}
                {level === 'medium' && '중'}
                {level === 'hard' && '상'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">문제 유형</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setQuestionType('short_answer')}
            disabled={isGenerating}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all',
              questionType === 'short_answer'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="font-medium mb-1">단답형</div>
            <div className="text-xs text-muted-foreground">
              짧은 답변이 필요한 문제
            </div>
          </button>

          <button
            onClick={() => setQuestionType('essay')}
            disabled={isGenerating}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all',
              questionType === 'essay'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="font-medium mb-1">서술형</div>
            <div className="text-xs text-muted-foreground">
              자세한 설명이 필요한 문제
            </div>
          </button>
        </div>
      </div>

      {/* Question Count Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">문제 개수</label>
        <div className="grid grid-cols-4 gap-2">
          {QUESTION_COUNTS.map((num) => (
            <button
              key={num}
              onClick={() => setCount(num)}
              disabled={isGenerating}
              className={cn(
                'py-2 px-3 rounded-lg border-2 font-medium transition-all',
                count === num
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50',
                isGenerating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {num}개
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selection (Optional) */}
      {availableTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">주제 선택 (선택사항)</label>
            <button
              onClick={() => setShowTopicSelector(!showTopicSelector)}
              disabled={isGenerating}
              className="text-sm text-primary hover:underline"
            >
              {showTopicSelector ? '닫기' : '주제 선택'}
            </button>
          </div>

          {showTopicSelector && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTopics([])}
                  disabled={isGenerating}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm transition-all',
                    selectedTopics.length === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border hover:border-primary'
                  )}
                >
                  전체
                </button>
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    disabled={isGenerating}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-all',
                      selectedTopics.includes(topic)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border hover:border-primary'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            <span>문제 생성 중...</span>
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span>문제 생성하기</span>
          </>
        )}
      </button>

      {/* Estimated Time */}
      {isGenerating && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>예상 소요 시간: 약 {estimatedTime}초</span>
        </div>
      )}

      {/* Selection Summary */}
      {!isGenerating && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <div className="font-medium mb-2">선택 요약</div>
          <div className="space-y-1 text-muted-foreground">
            <div>
              • 난이도:{' '}
              {difficulty === 'easy' && '하'}
              {difficulty === 'medium' && '중'}
              {difficulty === 'hard' && '상'}
            </div>
            <div>
              • 유형: {questionType === 'short_answer' ? '단답형' : '서술형'}
            </div>
            <div>• 문제 수: {count}개</div>
            {selectedTopics.length > 0 && (
              <div>• 주제: {selectedTopics.join(', ')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
