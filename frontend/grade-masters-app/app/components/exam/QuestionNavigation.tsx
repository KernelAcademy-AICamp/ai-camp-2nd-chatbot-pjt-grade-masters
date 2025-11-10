'use client';

import { cn } from '@/app/utils/helpers';
import type { Question, Answer } from '@/types';

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, Answer>;
  flaggedQuestions: Set<string>;
  onSelectQuestion: (index: number) => void;
  onClose: () => void;
}

export default function QuestionNavigation({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  onClose,
}: QuestionNavigationProps) {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;
  const unansweredCount = questions.length - answeredCount;

  const getQuestionStatus = (question: Question) => {
    const isAnswered = answers[question.id]?.content?.trim();
    const isFlagged = flaggedQuestions.has(question.id);

    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">문제 목록</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground">답변 완료</div>
              <div className="text-2xl font-bold text-green-600">
                {answeredCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
              <div className="text-sm text-muted-foreground">미답변</div>
              <div className="text-2xl font-bold text-gray-600">
                {unansweredCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-sm text-muted-foreground">플래그</div>
              <div className="text-2xl font-bold text-yellow-600">
                {flaggedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => onSelectQuestion(index)}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 font-medium transition-all',
                    'hover:scale-105 active:scale-95',
                    isCurrent && 'ring-2 ring-primary ring-offset-2',
                    status === 'answered' &&
                      'bg-green-500/20 border-green-500 text-green-700',
                    status === 'unanswered' &&
                      'bg-muted border-border text-muted-foreground',
                    status === 'flagged' &&
                      'bg-yellow-500/20 border-yellow-500 text-yellow-700'
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Flag Icon */}
                  {status === 'flagged' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="absolute top-0.5 right-0.5 h-3 w-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
                      />
                    </svg>
                  )}

                  {/* Difficulty Indicator */}
                  <div
                    className={cn(
                      'absolute bottom-0.5 left-0.5 h-1 w-1 rounded-full',
                      question.difficulty === 'easy' && 'bg-green-500',
                      question.difficulty === 'medium' && 'bg-yellow-500',
                      question.difficulty === 'hard' && 'bg-red-500'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm font-medium mb-3">범례</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border-2 border-green-500 bg-green-500/20" />
                <span className="text-muted-foreground">답변 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border-2 border-border bg-muted" />
                <span className="text-muted-foreground">미답변</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border-2 border-yellow-500 bg-yellow-500/20" />
                <span className="text-muted-foreground">플래그 설정</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border-2 border-primary ring-2 ring-primary ring-offset-2" />
                <span className="text-muted-foreground">현재 문제</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">난이도</div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">하</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">중</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">상</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
