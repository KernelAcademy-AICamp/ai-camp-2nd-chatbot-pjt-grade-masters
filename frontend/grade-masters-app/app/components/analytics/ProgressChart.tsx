import { memo } from 'react';
import { formatPercentage } from '@/app/utils/helpers';
import type { RecentResult } from '@/types';

interface ProgressChartProps {
  recentResults: RecentResult[];
  trend: 'improving' | 'stable' | 'no_data';
}

function ProgressChart({ recentResults, trend }: ProgressChartProps) {
  if (recentResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-12 w-12 text-muted-foreground mb-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        <p className="text-sm text-muted-foreground">아직 데이터가 없습니다</p>
      </div>
    );
  }

  // Calculate average accuracy
  const averageAccuracy =
    recentResults.reduce((sum, result) => sum + result.accuracy, 0) / recentResults.length;

  // Get trend info
  const getTrendInfo = () => {
    switch (trend) {
      case 'improving':
        return {
          icon: '📈',
          text: '상승 중',
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
        };
      case 'stable':
        return {
          icon: '➡️',
          text: '안정',
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
        };
      default:
        return {
          icon: '📊',
          text: '데이터 없음',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <div className="space-y-6">
      {/* Average Score Display */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <p className="text-sm text-muted-foreground mb-1">평균 정확도</p>
          <p className="text-3xl font-bold">{formatPercentage(averageAccuracy)}</p>
        </div>
        <div className={`px-3 py-2 rounded-lg ${trendInfo.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{trendInfo.icon}</span>
            <span className={`text-sm font-medium ${trendInfo.color}`}>{trendInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Recent Results List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">최근 시험 결과</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentResults.map((result) => {
            const getAccuracyColor = (accuracy: number) => {
              if (accuracy >= 90) return 'bg-green-500';
              if (accuracy >= 80) return 'bg-blue-500';
              if (accuracy >= 70) return 'bg-yellow-500';
              return 'bg-red-500';
            };

            const date = new Date(result.created_at);
            const formattedDate = date.toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={result.result_id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium truncate">{result.document_name}</p>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAccuracyColor(result.accuracy)} transition-all`}
                      style={{ width: `${result.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    {formatPercentage(result.accuracy, 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(ProgressChart);
