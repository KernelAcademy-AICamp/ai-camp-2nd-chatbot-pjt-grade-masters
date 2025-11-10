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
    setFilter,
    setSorting,
    retryQuestion,
    markAsResolved,
    deleteWrongAnswer,
    clearAll,
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

        {/* Filter Section */}
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

        {/* Statistics Summary */}
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

        {/* Wrong Answers List */}
        <WrongAnswersList
          wrongAnswers={filteredAnswers}
          onRetry={retryQuestion}
          onResolve={markAsResolved}
          onDelete={deleteWrongAnswer}
        />

        {/* Empty State */}
        {stats.totalWrong === 0 && (
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
