'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/app/utils/helpers';
import type { Question, Answer } from '@/types';
import AnswerInput from './AnswerInput';
import AnswerEditor from './AnswerEditor';
import QuestionNavigation from './QuestionNavigation';

interface ExamModeProps {
  questions: Question[];
  onSubmit: (answers: Answer[], timeSpent: number) => void;
  onExit: () => void;
  timeLimit?: number; // in minutes, optional
}

export default function ExamMode({
  questions,
  onSubmit,
  onExit,
  timeLimit,
}: ExamModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-save answers to localStorage
  useEffect(() => {
    const examState = {
      answers,
      currentQuestionIndex,
      flaggedQuestions: Array.from(flaggedQuestions),
      startTime,
    };
    localStorage.setItem('exam-state', JSON.stringify(examState));
  }, [answers, currentQuestionIndex, flaggedQuestions, startTime]);

  // Time limit warning
  useEffect(() => {
    if (timeLimit && elapsedTime >= timeLimit * 60) {
      handleSubmit();
    }
  }, [elapsedTime, timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!timeLimit) return null;
    const remaining = timeLimit * 60 - elapsedTime;
    return remaining > 0 ? remaining : 0;
  };

  const handleAnswerChange = (content: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        content,
        submittedAt: new Date(),
        isFlagged: flaggedQuestions.has(currentQuestion.id),
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowNavigationModal(false);
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.values(answers);
    onSubmit(answersArray, timeSpent);
    localStorage.removeItem('exam-state');
    setShowSubmitModal(false);
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Progress */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex items-center gap-2 text-sm font-medium',
                  timeLimit &&
                    getRemainingTime()! < 300 &&
                    'text-destructive animate-pulse'
                )}
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {timeLimit ? (
                  <span>남은 시간: {formatTime(getRemainingTime()!)}</span>
                ) : (
                  <span>경과 시간: {formatTime(elapsedTime)}</span>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={isFullscreen ? '전체화면 해제' : '전체화면'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  {isFullscreen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  )}
                </svg>
              </button>

              {/* Navigation Modal Button */}
              <button
                onClick={() => setShowNavigationModal(true)}
                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                문제 목록
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Question Card */}
          <div className="rounded-lg border bg-card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    문제 {currentQuestionIndex + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {currentQuestion.difficulty === 'easy' && '하'}
                    {currentQuestion.difficulty === 'medium' && '중'}
                    {currentQuestion.difficulty === 'hard' && '상'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    {currentQuestion.points}점
                  </span>
                </div>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.content}
                </p>
              </div>

              {/* Flag Button */}
              <button
                onClick={toggleFlag}
                className={cn(
                  'ml-4 p-2 rounded-lg transition-colors',
                  flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-yellow-500/20 text-yellow-600'
                    : 'hover:bg-muted'
                )}
                title={
                  flaggedQuestions.has(currentQuestion.id)
                    ? '플래그 해제'
                    : '플래그 설정'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'currentColor'
                      : 'none'
                  }
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
                  />
                </svg>
              </button>
            </div>

            {/* Answer Input */}
            {currentQuestion.type === 'short_answer' ? (
              <AnswerInput
                value={answers[currentQuestion.id]?.content || ''}
                onChange={handleAnswerChange}
                placeholder="답변을 입력하세요..."
              />
            ) : (
              <AnswerEditor
                value={answers[currentQuestion.id]?.content || ''}
                onChange={handleAnswerChange}
                placeholder="답변을 작성하세요..."
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={cn(
                'px-4 py-2 rounded-lg border font-medium transition-colors',
                'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              ← 이전 문제
            </button>

            <div className="text-sm text-muted-foreground">
              답변: {answeredCount} / 미답: {unansweredCount}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitClick}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                제출하기
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg border font-medium hover:bg-muted transition-colors"
              >
                다음 문제 →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Navigation Modal */}
      {showNavigationModal && (
        <QuestionNavigation
          questions={questions}
          currentIndex={currentQuestionIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onSelectQuestion={handleGoToQuestion}
          onClose={() => setShowNavigationModal(false)}
        />
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">제출 확인</h3>
            <p className="text-sm text-muted-foreground mb-4">
              정말 제출하시겠습니까?
            </p>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <p className="text-sm text-yellow-600">
                  ⚠️ {unansweredCount}개의 문제가 미답변 상태입니다.
                </p>
              </div>
            )}

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 문제:</span>
                <span className="font-medium">{questions.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">답변 완료:</span>
                <span className="font-medium">{answeredCount}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">소요 시간:</span>
                <span className="font-medium">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
