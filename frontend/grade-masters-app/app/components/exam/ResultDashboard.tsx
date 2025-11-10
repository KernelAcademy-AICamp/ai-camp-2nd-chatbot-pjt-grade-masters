'use client';

import { useState } from 'react';
import { cn } from '@/app/utils/helpers';
import type { ExamResult, Question } from '@/types';

interface ResultDashboardProps {
  result: ExamResult;
  questions: Question[];
  onRetry?: () => void;
  onReviewWrongAnswers?: () => void;
  onClose?: () => void;
}

export default function ResultDashboard({
  result,
  questions,
  onRetry,
  onReviewWrongAnswers,
  onClose,
}: ResultDashboardProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const correctCount = result.results.filter((r) => r.isCorrect).length;
  const incorrectCount = result.results.length - correctCount;
  const accuracy = (correctCount / result.results.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Overall Result Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-4">
            <span
              className={cn(
                'text-4xl font-bold',
                getGradeColor(result.percentage)
              )}
            >
              {getGradeLabel(result.percentage)}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">시험 완료!</h2>
          <p className="text-muted-foreground">
            수고하셨습니다. 시험 결과를 확인하세요.
          </p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-sm text-muted-foreground mb-1">총점</div>
            <div className="text-2xl font-bold">
              {result.totalScore} / {result.maxScore}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-sm text-muted-foreground mb-1">정답률</div>
            <div className={cn('text-2xl font-bold', getGradeColor(accuracy))}>
              {accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 text-center">
            <div className="text-sm text-muted-foreground mb-1">정답</div>
            <div className="text-2xl font-bold text-green-600">
              {correctCount}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10 text-center">
            <div className="text-sm text-muted-foreground mb-1">오답</div>
            <div className="text-2xl font-bold text-red-600">
              {incorrectCount}
            </div>
          </div>
        </div>

        {/* Time Spent */}
        {result.timeSpent && (
          <div className="mt-4 pt-4 border-t text-center">
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
              <span>
                소요 시간: {Math.floor(result.timeSpent / 60)}분{' '}
                {result.timeSpent % 60}초
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
            >
              다시 풀기
            </button>
          )}
          {onReviewWrongAnswers && incorrectCount > 0 && (
            <button
              onClick={onReviewWrongAnswers}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              오답 복습하기
            </button>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">문제별 결과</h3>

        <div className="space-y-3">
          {result.results.map((grading, index) => {
            const question = questions.find((q) => q.id === grading.questionId);
            if (!question) return null;

            const isExpanded = expandedQuestions.has(question.id);
            const isCorrect = grading.isCorrect;

            return (
              <div
                key={question.id}
                className={cn(
                  'rounded-lg border transition-all',
                  isCorrect
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                )}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">문제 {index + 1}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {question.difficulty === 'easy' && '하'}
                          {question.difficulty === 'medium' && '중'}
                          {question.difficulty === 'hard' && '상'}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            isCorrect
                              ? 'bg-green-500/20 text-green-700'
                              : 'bg-red-500/20 text-red-700'
                          )}
                        >
                          {isCorrect ? '정답' : '오답'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {question.content}
                      </p>
                    </div>

                    <div className="ml-4 flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">점수</div>
                        <div
                          className={cn(
                            'text-lg font-bold',
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {grading.score} / {grading.maxScore}
                        </div>
                      </div>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={cn(
                          'h-5 w-5 transition-transform',
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
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t">
                    {/* Question */}
                    <div>
                      <div className="text-sm font-medium mb-2 mt-4">문제</div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {question.content}
                      </p>
                    </div>

                    {/* Feedback */}
                    {grading.feedback && (
                      <div>
                        <div className="text-sm font-medium mb-2">평가</div>
                        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground whitespace-pre-wrap">
                          {grading.feedback}
                        </div>
                      </div>
                    )}

                    {/* Model Answer */}
                    {grading.modelAnswer && !isCorrect && (
                      <div>
                        <div className="text-sm font-medium mb-2">모범 답안</div>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm whitespace-pre-wrap">
                          {grading.modelAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">성적 분석</h3>

        {/* Difficulty Analysis */}
        <div className="space-y-3">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const difficultyQuestions = questions.filter(
              (q) => q.difficulty === difficulty
            );
            const difficultyResults = result.results.filter((r) =>
              difficultyQuestions.some((q) => q.id === r.questionId)
            );
            const difficultyCorrect = difficultyResults.filter(
              (r) => r.isCorrect
            ).length;
            const difficultyTotal = difficultyResults.length;
            const difficultyPercentage =
              difficultyTotal > 0
                ? (difficultyCorrect / difficultyTotal) * 100
                : 0;

            if (difficultyTotal === 0) return null;

            return (
              <div key={difficulty}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {difficulty === 'easy' && '하'}
                    {difficulty === 'medium' && '중'}
                    {difficulty === 'hard' && '상'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {difficultyCorrect} / {difficultyTotal} (
                    {difficultyPercentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      difficulty === 'easy' && 'bg-green-500',
                      difficulty === 'medium' && 'bg-yellow-500',
                      difficulty === 'hard' && 'bg-red-500'
                    )}
                    style={{ width: `${difficultyPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
        >
          닫기
        </button>
      )}
    </div>
  );
}
