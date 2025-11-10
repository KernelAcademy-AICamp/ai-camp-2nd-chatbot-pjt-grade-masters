import { memo } from 'react';
import { cn } from '@/app/utils/helpers';

interface RecommendationCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function RecommendationCard({
  title,
  icon,
  children,
  className,
}: RecommendationCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default memo(RecommendationCard);
