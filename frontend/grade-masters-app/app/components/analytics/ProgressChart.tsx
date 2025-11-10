import { memo } from 'react';
import { cn, formatPercentage } from '@/app/utils/helpers';

interface ProgressChartProps {
  totalQuestions: number;
  averageScore: number;
}

function ProgressChart({ totalQuestions, averageScore }: ProgressChartProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-500';
    if (score >= 80) return 'text-blue-600 bg-blue-500';
    if (score >= 70) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  if (totalQuestions === 0) {
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

  const scoreColor = getScoreColor(averageScore);
  const grade = getScoreGrade(averageScore);

  return (
    <div className="space-y-6">
      {/* Score Circle */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="h-40 w-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - averageScore / 100)}`}
              className={cn(scoreColor.split(' ')[1])}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn('text-3xl font-bold', scoreColor.split(' ')[0])}>
              {grade}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatPercentage(averageScore, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <div className="text-xs text-muted-foreground">총 문제 수</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{formatPercentage(averageScore, 0)}</div>
          <div className="text-xs text-muted-foreground">평균 점수</div>
        </div>
      </div>

      {/* Progress Levels */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">F</span>
          <span className="text-muted-foreground">D</span>
          <span className="text-muted-foreground">C</span>
          <span className="text-muted-foreground">B</span>
          <span className="text-muted-foreground">A</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="h-full bg-red-500" style={{ width: '20%' }} />
            <div className="h-full bg-orange-500" style={{ width: '20%' }} />
            <div className="h-full bg-yellow-500" style={{ width: '20%' }} />
            <div className="h-full bg-blue-500" style={{ width: '20%' }} />
            <div className="h-full bg-green-500" style={{ width: '20%' }} />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${averageScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(ProgressChart);
