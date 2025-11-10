'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/app/utils/helpers';

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function AnswerInput({
  value,
  onChange,
  placeholder = '답변을 입력하세요...',
  disabled = false,
}: AnswerInputProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!value) return;

    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [value]);

  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-background',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-base'
          )}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{characterCount}자</span>
          <span>{wordCount}단어</span>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3 w-3 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-green-600">
              자동 저장됨 ({lastSaved.toLocaleTimeString()})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
