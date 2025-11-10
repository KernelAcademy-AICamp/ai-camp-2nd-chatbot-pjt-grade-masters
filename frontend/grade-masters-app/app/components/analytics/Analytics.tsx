'use client';

import { useLearningStats } from '@/app/hooks/useLearningStats';
import { cn, formatPercentage } from '@/app/utils/helpers';
import StatCard from './StatCard';
import ProgressChart from './ProgressChart';
import WeakAreasChart from './WeakAreasChart';
import RecommendationCard from './RecommendationCard';

export default function Analytics() {
  const { stats, getWeakAreas, getStrongAreas, getImprovementRate } =
    useLearningStats();

  const improvementRate = getImprovementRate();
  const weakAreas = getWeakAreas();
  const strongAreas = getStrongAreas();

  // Calculate study hours
  const studyHours = Math.floor(stats.totalStudyTime / 60);
  const studyMinutes = stats.totalStudyTime % 60;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">학습 분석</h1>
        <p className="text-muted-foreground">
          당신의 학습 현황과 성취도를 확인하세요
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 학습 시간"
          value={`${studyHours}시간 ${studyMinutes}분`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          trend={improvementRate > 0 ? 'up' : improvementRate < 0 ? 'down' : undefined}
        />

        <StatCard
          title="처리한 PDF"
          value={`${stats.totalPDFsProcessed}개`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          }
        />

        <StatCard
          title="풀이한 문제"
          value={`${stats.totalQuestionsSolved}개`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          }
        />

        <StatCard
          title="평균 점수"
          value={formatPercentage(stats.averageScore)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          }
          trend={improvementRate > 0 ? 'up' : improvementRate < 0 ? 'down' : undefined}
          trendValue={improvementRate !== 0 ? `${improvementRate > 0 ? '+' : ''}${improvementRate}%` : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">학습 진도</h3>
          <ProgressChart
            totalQuestions={stats.totalQuestionsSolved}
            averageScore={stats.averageScore}
          />
        </div>

        {/* Weak Areas */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">취약 분야</h3>
          <WeakAreasChart weakAreas={weakAreas} />
        </div>
      </div>

      {/* Strong Areas */}
      {strongAreas.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">강점 분야</h3>
          <div className="space-y-3">
            {strongAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{area.topic}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${area.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600 w-12 text-right">
                    {formatPercentage(area.accuracy, 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecommendationCard
          title="추천 학습 방향"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
          }
        >
          {weakAreas.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {weakAreas.slice(0, 3).map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>{area.topic}</strong> 분야를 집중 학습하세요
                    (정답률: {formatPercentage(area.accuracy, 0)})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              아직 충분한 데이터가 없습니다. 더 많은 문제를 풀어보세요!
            </p>
          )}
        </RecommendationCard>

        <RecommendationCard
          title="학습 권장사항"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          }
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>매일 30분 이상 꾸준히 학습하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>오답노트를 활용하여 취약점을 보완하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>다양한 난이도의 문제를 골고루 풀어보세요</span>
            </li>
          </ul>
        </RecommendationCard>
      </div>
    </div>
  );
}
