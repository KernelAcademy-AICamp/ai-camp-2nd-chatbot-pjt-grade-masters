'use client';

import { useState } from 'react';
import { cn, formatRelativeTime } from '@/app/utils/helpers';
import type { WrongAnswer, QuestionDifficulty } from '@/types';

interface WrongAnswersListProps {
  wrongAnswers: WrongAnswer[];
  onRetry: (id: string) => void;
  onMarkResolved: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function WrongAnswersList({
  wrongAnswers,
  onRetry,
  onMarkResolved,
  onDelete,
}: WrongAnswersListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDifficultyColor = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-500/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-500/10';
      case 'hard':
        return 'text-red-600 bg-red-500/10';
    }
  };

  const getDifficultyLabel = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return '하';
      case 'medium':
        return '중';
      case 'hard':
        return '상';
    }
  };

  if (wrongAnswers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-16 w-16 text-muted-foreground mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">오답이 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          모든 문제를 정확하게 풀었거나 아직 시험을 보지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wrongAnswers.map((wrongAnswer) => {
        const isExpanded = expandedId === wrongAnswer.id;
        const { question } = wrongAnswer;

        return (
          <div
            key={wrongAnswer.id}
            className={cn(
              'rounded-lg border bg-card transition-all',
              wrongAnswer.isResolved
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-border'
            )}
          >
            {/* Header */}
            <button
              onClick={() => toggleExpanded(wrongAnswer.id)}
              className="w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Difficulty Badge */}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getDifficultyColor(question.difficulty)
                      )}
                    >
                      {getDifficultyLabel(question.difficulty)}
                    </span>

                    {/* Topic Badge */}
                    {question.topic && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {question.topic}
                      </span>
                    )}

                    {/* Retry Count */}
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                      {wrongAnswer.retryCount}회 시도
                    </span>

                    {/* Resolved Badge */}
                    {wrongAnswer.isResolved && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 text-xs font-medium">
                        ✓ 해결됨
                      </span>
                    )}
                  </div>

                  <p className="text-sm line-clamp-2 mb-2">
                    {question.content}
                  </p>

                  {wrongAnswer.lastRetryAt && (
                    <p className="text-xs text-muted-foreground">
                      마지막 시도: {formatRelativeTime(wrongAnswer.lastRetryAt)}
                    </p>
                  )}
                </div>

                {/* Expand Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={cn(
                    'h-5 w-5 transition-transform flex-shrink-0',
                    isExpanded && 'rotate-180'
                  )}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t">
                {/* Question */}
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">문제</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {question.content}
                  </p>
                </div>

                {/* Feedback */}
                {wrongAnswer.feedback && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">피드백</h4>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                      {wrongAnswer.feedback}
                    </div>
                  </div>
                )}

                {/* Correct Answer */}
                {wrongAnswer.correctAnswer && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">모범 답안</h4>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                      {wrongAnswer.correctAnswer}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry(wrongAnswer.id);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    다시 풀기
                  </button>

                  {!wrongAnswer.isResolved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkResolved(wrongAnswer.id);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                    >
                      해결됨으로 표시
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(wrongAnswer.id);
                    }}
                    className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
