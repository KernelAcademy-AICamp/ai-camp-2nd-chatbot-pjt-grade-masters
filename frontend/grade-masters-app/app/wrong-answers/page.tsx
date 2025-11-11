'use client';

import { useWrongAnswers } from '@/app/hooks/useWrongAnswers';
import WrongAnswersList from '@/app/components/wronganswers/WrongAnswersList';
import WrongAnswersFilter from '@/app/components/wronganswers/WrongAnswersFilter';

export default function WrongAnswersPage() {
  const {
    filteredAnswers,
    stats,
    filter,
    sortBy,
    sortOrder,
    loading,
    error,
    recommendation,
    setFilter,
    setSorting,
    retryQuestion,
    markAsResolved,
    deleteWrongAnswer,
    clearAll,
    refreshData,
  } = useWrongAnswers();

  // Extract topics from stats
  const topics = Object.keys(stats.byTopic);

  // Handle filter changes
  const handleDifficultyChange = (difficulty?: import('@/types').QuestionDifficulty) => {
    setFilter({ ...filter, difficulty });
  };

  const handleTopicChange = (topic?: string) => {
    setFilter({ ...filter, topic });
  };

  const handleShowResolvedChange = (show: boolean) => {
    setFilter({ ...filter, isResolved: show ? undefined : false });
  };

  const handleSortChange = (
    newSortBy: 'date' | 'retryCount' | 'difficulty' | 'topic',
    newSortOrder: 'asc' | 'desc'
  ) => {
    setSorting(newSortBy, newSortOrder);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">오답 노트</h1>
          <p className="text-muted-foreground">
            틀린 문제를 복습하고 취약점을 개선하세요
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-red-600 dark:text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button
                onClick={() => refreshData()}
                className="px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
              >
                재시도
              </button>
            </div>
          </div>
        )}

        {/* Recommendation Banner */}
        {recommendation && !loading && !error && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">학습 추천</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">오답 데이터를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        {!loading && (
          <div className="mb-6">
            <WrongAnswersFilter
              difficulty={filter.difficulty}
              topics={topics}
              selectedTopic={filter.topic}
              showResolved={filter.isResolved !== false}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onDifficultyChange={handleDifficultyChange}
              onTopicChange={handleTopicChange}
              onShowResolvedChange={handleShowResolvedChange}
              onSortChange={handleSortChange}
              onClearAll={clearAll}
            />
          </div>
        )}

        {/* Statistics Summary */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border p-4">
              <div className="text-2xl font-bold">{stats.totalWrong}</div>
              <div className="text-sm text-muted-foreground">총 오답 수</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.byDifficulty.hard || 0}
              </div>
              <div className="text-sm text-muted-foreground">어려운 문제</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
              <div className="text-sm text-muted-foreground">해결됨</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.unresolved}
              </div>
              <div className="text-sm text-muted-foreground">복습 필요</div>
            </div>
          </div>
        )}

        {/* Wrong Answers List */}
        {!loading && (
          <WrongAnswersList
            wrongAnswers={filteredAnswers}
            onRetry={retryQuestion}
            onMarkResolved={markAsResolved}
            onDelete={deleteWrongAnswer}
          />
        )}

        {/* Empty State */}
        {!loading && stats.totalWrong === 0 && (
          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">
              오답이 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              문제를 풀면 틀린 문제들이 여기에 표시됩니다
            </p>
            <a
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              문제 풀러 가기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
