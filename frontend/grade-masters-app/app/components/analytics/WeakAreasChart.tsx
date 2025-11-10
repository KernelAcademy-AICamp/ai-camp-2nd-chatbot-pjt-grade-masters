import { memo } from 'react';
import { formatPercentage } from '@/app/utils/helpers';

interface WeakArea {
  topic: string;
  accuracy: number;
}

interface WeakAreasChartProps {
  weakAreas: WeakArea[];
}

function WeakAreasChart({ weakAreas }: WeakAreasChartProps) {
  if (weakAreas.length === 0) {
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
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-muted-foreground">취약 분야가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weakAreas.map((area, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{area.topic}</span>
            <span className="text-sm text-muted-foreground">
              {formatPercentage(area.accuracy, 0)}
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${area.accuracy}%` }}
              />
            </div>
          </div>
        </div>
      ))}

      {weakAreas.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-yellow-600 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                집중 학습이 필요합니다
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                위 분야들은 정답률이 낮습니다. 오답노트를 활용하여 집중적으로
                복습하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WeakAreasChart);
