'use client';

import { useState } from 'react';
import { cn } from '@/app/utils/helpers';
import type { Summary } from '@/types';

interface SummaryDisplayProps {
  summary: Summary;
}

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyToClipboard = () => {
    const text = `${summary.content}\n\n${summary.sections.map((s) => `${s.title}\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
    console.log('Copied to clipboard');
  };

  const exportAsText = () => {
    const text = `${summary.content}\n\n${summary.sections.map((s) => `${s.title}\n${s.content}`).join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${summary.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">요약 결과</h3>
          <p className="text-sm text-muted-foreground">
            {summary.type === 'simple' ? '간단 요약' : '상세 요약'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="복사하기"
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
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
          </button>

          <button
            onClick={exportAsText}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="텍스트 내보내기"
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Summary Content */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.content}</p>
      </div>

      {/* Keywords */}
      {summary.keywords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">핵심 키워드</h4>
          <div className="flex flex-wrap gap-2">
            {summary.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {summary.sections.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">섹션별 상세 내용</h4>
          <div className="space-y-3">
            {summary.sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);

              return (
                <div key={section.id} className="rounded-lg border bg-card">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium">{section.title}</h5>
                      {section.pageRange && (
                        <p className="text-xs text-muted-foreground mt-1">
                          페이지 {section.pageRange.start}-{section.pageRange.end}
                        </p>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={cn(
                        'h-5 w-5 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
